'use client';

import { LngLat, LngLatList, Route, shallow, useStore } from '@/store';
import 'mapbox-gl/dist/mapbox-gl.css';
import dynamic from 'next/dynamic';
import Map, { ScaleControl } from 'react-map-gl';
import { getPathForWaypoints } from './api';
import mapStyle from './map-style.json';
import styles from './page.module.css';
import RoutePath from './route-path';
import Routes from './routes';
import Waypoints from './waypoints';

function App() {
  const [
    mapViewState,
    activeRoute,
    isDragging,
    setViewState,
    setRouteWaypoints,
    setRoutePathGeometry,
    selectRouteWaypoint,
  ] = useStore(
    (s) => [
      s.mapViewState,
      s.activeRouteId === null ? null : s.routes[s.activeRouteId],
      s.isDragging,
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
        cursor={activeRoute !== null && isDragging ? 'grabbing' : 'default'}
      >
        <ScaleControl unit="imperial" />
        {activeRoute !== null && (
          <RoutePath geometry={activeRoute.pathGeometry} />
        )}
        {activeRoute !== null && <Waypoints route={activeRoute} />}
      </Map>
    </main>
  );
}

// Disable SSR application-wide
const NonSSRApp = dynamic(() => Promise.resolve(App), {
  ssr: false,
});

export default NonSSRApp;
