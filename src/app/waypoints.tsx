import { LngLat, Route, shallow, useStore } from '@/store';
import { FeatureCollection } from 'geojson';
import { MapMouseEvent } from 'mapbox-gl';
import { useRef } from 'react';
import { CircleLayer, Layer, Source, useMap } from 'react-map-gl';
import { getPathForWaypoints } from './api';
import colors from './colors';

const sourceId = 'route-waypoints_source';
export const layerId = 'route-waypoints_layer';
const layer: CircleLayer = {
  id: layerId,
  source: sourceId,
  type: 'circle',
  paint: {
    'circle-color': colors.plum11,
    'circle-radius': [
      'interpolate',
      ['exponential', 1.5],
      ['zoom'],
      10,
      4,
      18,
      16,
    ],
    'circle-stroke-width': [
      'case',
      ['boolean', ['get', 'selected'], false],
      2,
      0,
    ],
    'circle-stroke-color': colors.plum12,
  },
};

export default function Waypoints({ route }: { route: Route }) {
  const { current: map } = useMap();
  const draggedWaypoint = useRef<{
    index: number;
    initialLngLat: LngLat;
  } | null>(null);
  const [setRouteWaypoints, selectRouteWaypoint, setRoutePathGeometry] =
    useStore(
      (s) => [
        s.setRouteWaypoints,
        s.selectRouteWaypoint,
        s.setRoutePathGeometry,
      ],
      shallow
    );

  if (route.waypoints.length === 0) return null;

  async function moveRouteWaypoint(
    route: Route,
    waypointIndex: number,
    lngLat: LngLat
  ) {
    const newWaypoints = [...route.waypoints];
    newWaypoints[waypointIndex] = lngLat;
    setRouteWaypoints(route.id, newWaypoints);
    selectRouteWaypoint(route.id, waypointIndex);
    setRoutePathGeometry(route.id, await getPathForWaypoints(newWaypoints));
  }

  const geojson: FeatureCollection = {
    type: 'FeatureCollection',
    features: route.waypoints.map((waypoint, i) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: waypoint,
      },
      properties: {
        waypointIndex: i,
        selected: route.selectedWaypointIndex === i,
      },
    })),
  };

  const canvas = map.getCanvasContainer();

  function onMove(e: MapMouseEvent) {
    const { lng, lat } = e.lngLat;

    // Set a UI indicator for dragging.
    canvas.style.cursor = 'grabbing';

    // Update the Point feature in `geojson` coordinates
    // and call setData to the source layer `point` on it.
    geojson.features[draggedWaypoint.current.index].geometry.coordinates = [
      lng,
      lat,
    ];
    map.getSource(sourceId).setData(geojson);
  }

  function onUp(e: MapMouseEvent) {
    e.originalEvent.preventDefault();
    const { lng, lat } = e.lngLat;
    const [initialLng, initialLat] = draggedWaypoint.current.initialLngLat;

    if (lng === initialLng && lat === initialLat) {
      // select waypoint if cursor hasn't moved
      selectRouteWaypoint(route.id, draggedWaypoint.current.index);
    } else {
      // otherwise, persist the change to the waypoint
      moveRouteWaypoint(route, draggedWaypoint.current.index, [lng, lat]);
    }

    canvas.style.cursor = '';

    // Unbind mouse/touch events
    map.off('mousemove', onMove);
    map.off('touchmove', onMove);
    draggedWaypoint.current = null;
  }

  // When the cursor enters a feature in
  // the point layer, prepare for dragging.
  map.on('mouseenter', layerId, () => {
    // TODO: does this not work?
    canvas.style.cursor = 'move';
  });

  map.on('mouseleave', layerId, () => {
    canvas.style.cursor = '';
  });

  map.on('mousedown', layerId, (e) => {
    // Prevent the default map drag behavior.
    e.preventDefault();

    // ignore other mousedown eventes until dragging is finished
    if (draggedWaypoint.current !== null) return;

    canvas.style.cursor = 'grab';
    draggedWaypoint.current = {
      index: e.features[0].properties.waypointIndex,
      initialLngLat: e.features[0].geometry.coordinates,
    };

    map.on('mousemove', onMove);
    map.once('mouseup', onUp);
  });

  map.on('touchstart', layerId, (e) => {
    if (e.points.length !== 1) return;

    // Prevent the default map drag behavior.
    e.preventDefault();
    draggedWaypoint.current = {
      index: e.features[0].properties.waypointIndex,
      initialLngLat: e.features[0].geometry.coordinates,
    };

    map.on('touchmove', onMove);
    map.once('touchend', onUp);
  });

  return (
    <Source id={sourceId} type="geojson" data={geojson}>
      <Layer {...layer} />
    </Source>
  );
}
