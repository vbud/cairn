'use client';

import {
  LineString,
  LngLat,
  LngLatList,
  Route,
  shallow,
  useStore,
} from '@/store';
import 'mapbox-gl/dist/mapbox-gl.css';
import dynamic from 'next/dynamic';
import Map, { Marker, ScaleControl } from 'react-map-gl';
import colors from './colors';
import mapStyle from './map-style.json';
import styles from './page.module.css';
import RoutePath from './route-path';
import Routes from './routes';

async function getPathForWaypoints(
  routeWaypoints: LngLatList
): Promise<LineString> {
  if (Object.keys(routeWaypoints).length < 2)
    return { type: 'LineString', coordinates: [] };

  const routeWaypointsSerialized = routeWaypoints
    .map((waypoint) => waypoint.join(','))
    .join(';');

  try {
    const res = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/walking/${routeWaypointsSerialized}?overview=full&geometries=geojson&steps=false&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
    );
    const data = await res.json();
    return data.routes[0].geometry;
  } catch (err) {
    console.error(err);
    return { type: 'LineString', coordinates: [] };
  }
}

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

function App() {
  const [
    mapViewState,
    activeRoute,
    setViewState,
    setRouteWaypoints,
    setRoutePathGeometry,
    selectRouteWaypoint,
  ] = useStore(
    (s) => [
      s.mapViewState,
      s.activeRouteId === null ? null : s.routes[s.activeRouteId],
      s.setMapViewState,
      s.setRouteWaypoints,
      s.setRoutePathGeometry,
      s.selectRouteWaypoint,
    ],
    shallow
  );

  async function addRouteWaypoint(route: Route, lngLat: LngLat) {
    const newWaypoints: LngLatList = [...route.waypoints, lngLat];
    setRouteWaypoints(route.id, newWaypoints);
    selectRouteWaypoint(route.id, newWaypoints.length - 1);
    setRoutePathGeometry(route.id, await getPathForWaypoints(newWaypoints));
  }

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

  async function removeRouteWaypoint(route: Route, waypointIndex: number) {
    const newWaypoints: LngLatList = [...route.waypoints];
    newWaypoints.splice(waypointIndex, 1);
    setRouteWaypoints(route.id, newWaypoints);
    setRoutePathGeometry(route.id, await getPathForWaypoints(newWaypoints));
  }

  return (
    <main
      className={styles.root}
      onKeyUp={async (e) => {
        if (
          activeRoute !== null &&
          activeRoute.selectedWaypointIndex !== null &&
          e.key === 'Backspace'
        ) {
          removeRouteWaypoint(activeRoute, activeRoute.selectedWaypointIndex);
        }
      }}
    >
      <Routes />
      <Map
        reuseMaps
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        mapLib={import('mapbox-gl')}
        // @ts-ignore
        mapStyle={mapStyle}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        initialViewState={mapViewState}
        onMoveEnd={({ viewState: { longitude, latitude, zoom } }) => {
          setViewState({ longitude, latitude, zoom });
        }}
        onClick={async ({ lngLat: { lng, lat } }) => {
          if (activeRoute !== null) {
            // waypoints swallow clicks, so if we get here and there is a selected waypoint, unselect it
            if (activeRoute.selectedWaypointIndex !== null) {
              selectRouteWaypoint(activeRoute.id, null);
            }

            addRouteWaypoint(activeRoute, [lng, lat]);
          }
        }}
        cursor={activeRoute === null ? 'default' : 'crosshair'}
      >
        <ScaleControl unit="imperial" />
        {activeRoute !== null && (
          <RoutePath geometry={activeRoute.pathGeometry} />
        )}
        {activeRoute !== null &&
          activeRoute.waypoints.map(([lng, lat], i) => (
            <Marker
              key={`${lng}${lat}`}
              longitude={lng}
              latitude={lat}
              // stop marker clicks from propagating up to the the map
              onClick={(e) => {
                selectRouteWaypoint(activeRoute.id, i);
                e.originalEvent.stopPropagation();
              }}
              draggable
              onDragEnd={async ({ lngLat: { lng, lat } }) => {
                moveRouteWaypoint(activeRoute, i, [lng, lat]);
              }}
            >
              <WaypointSvg
                isSelected={activeRoute.selectedWaypointIndex === i}
              />
            </Marker>
          ))}
      </Map>
    </main>
  );
}

// Disable SSR application-wide
const NonSSRApp = dynamic(() => Promise.resolve(App), {
  ssr: false,
});

export default NonSSRApp;
