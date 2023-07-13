import { LngLat, Route, shallow, useStore } from '@/store';
import { Marker } from 'react-map-gl';
import { getPathForWaypoints } from './api';
import colors from './colors';

const waypointStyle = {
  cursor: 'pointer',
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

export default function Waypoints({ route }: { route: Route }) {
  const [
    setRouteWaypoints,
    setRoutePathGeometry,
    selectRouteWaypoint,
    startDraggingWaypoint,
    stopDraggingWaypoint,
  ] = useStore(
    (s) => [
      s.setRouteWaypoints,
      s.setRoutePathGeometry,
      s.selectRouteWaypoint,
      s.startDraggingWaypoint,
      s.stopDraggingWaypoint,
    ],
    shallow
  );

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

  return route.waypoints.map(([lng, lat], i) => (
    <Marker
      key={`${route.id}-${i}`}
      longitude={lng}
      latitude={lat}
      // stop marker clicks from propagating up to the map
      onClick={(e) => {
        selectRouteWaypoint(route.id, i);
        e.originalEvent.stopPropagation();
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
