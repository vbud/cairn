import { getPathForWaypoints } from '@/api';
import { Marker } from '@/components/map';
import { useStore } from '@/store';
import { LngLat, Route } from '@/types';
import { colors } from '@/utils';
import { Map } from 'mapbox-gl';

const waypointStyle = {
  fill: colors.plum11,
};
const selectedWaypointStyle = {
  ...waypointStyle,
  stroke: colors.plum12,
  strokeWidth: 2,
};
function WaypointSvg({ isSelected = false }: { isSelected: boolean }) {
  const innerR = 8;
  const r = isSelected ? innerR + 2 : innerR;
  const d = r * 2;
  return (
    <svg
      width={d}
      height={d}
      viewBox={`0 0 ${d} ${d}`}
      style={isSelected ? selectedWaypointStyle : waypointStyle}
    >
      <circle r={innerR} cx={r} cy={r} />
    </svg>
  );
}

export function RouteWaypoints({ map, route }: { map: Map; route: Route }) {
  const [
    setRouteWaypoints,
    setRoutePathGeometry,
    selectRouteWaypoint,
    startDraggingWaypoint,
    stopDraggingWaypoint,
  ] = useStore((s) => [
    s.setRouteWaypoints,
    s.setRoutePathGeometry,
    s.selectRouteWaypoint,
    s.startDraggingWaypoint,
    s.stopDraggingWaypoint,
  ]);

  async function moveRouteWaypoint(
    route: Route,
    waypointIndex: number,
    lngLat: LngLat
  ) {
    const newWaypoints = [...route.waypoints];
    newWaypoints[waypointIndex] = lngLat;
    setRouteWaypoints(route.id, newWaypoints);
    selectRouteWaypoint(route.id, waypointIndex);
    const newPath = await getPathForWaypoints(newWaypoints);
    if (newPath !== null) setRoutePathGeometry(route.id, newPath);
  }

  return route.waypoints.map(([lng, lat], i) => (
    <Marker
      key={i}
      map={map}
      longitude={lng}
      latitude={lat}
      // stop marker clicks from propagating up to the map
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        selectRouteWaypoint(route.id, i);
      }}
      draggable
      onDragStart={() => startDraggingWaypoint()}
      onDragEnd={async ({ lngLat: { lng, lat } }) => {
        moveRouteWaypoint(route, i, [lng, lat]);
        stopDraggingWaypoint();
      }}
    >
      <WaypointSvg isSelected={route.selectedWaypointIndex === i} />
    </Marker>
  ));
}
