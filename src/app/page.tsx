'use client';

import { LngLat, LngLatList, Route, useStore } from '@/store';
import 'mapbox-gl/dist/mapbox-gl.css';
import dynamic from 'next/dynamic';
import { useRef } from 'react';
import Map, { MapRef, ScaleControl } from 'react-map-gl';
import { getPathForWaypoints } from './api';
import Footpaths from './footpaths';
import styles from './page.module.css';
import RouteDetails from './route-details';
import RoutePath from './route-path';
import Routes from './routes';
import SlopeAngle from './slope-angle';
import Waypoints from './waypoints';

function App() {
  const [
    mapViewState,
    activeRoute,
    isDragging,
    setViewState,
    setMapIsReady,
    setRouteWaypoints,
    setRoutePathGeometry,
    selectRouteWaypoint,
  ] = useStore((s) => [
    s.mapViewState,
    s.activeRouteId === null ? null : s.routes[s.activeRouteId],
    s.isDragging,
    s.setMapViewState,
    s.setMapIsReady,
    s.setRouteWaypoints,
    s.setRoutePathGeometry,
    s.selectRouteWaypoint,
  ]);

  const mapRef = useRef<MapRef>(null);

  async function addRouteWaypoint(route: Route, lngLat: LngLat) {
    const newWaypoints: LngLatList = [...route.waypoints, lngLat];
    setRouteWaypoints(route.id, newWaypoints);
    selectRouteWaypoint(route.id, newWaypoints.length - 1);
    const newPath = await getPathForWaypoints(newWaypoints);
    if (newPath !== null) setRoutePathGeometry(route.id, newPath);
  }

  return (
    <main className={styles.root}>
      {activeRoute === null ? (
        <Routes />
      ) : (
        <RouteDetails route={activeRoute} mapRef={mapRef} />
      )}
      <Map
        ref={mapRef}
        mapLib={import('mapbox-gl')}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        reuseMaps
        mapStyle="mapbox://styles/vbud/clk0647oh002j01rjc69z9o6k"
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        initialViewState={mapViewState}
        onMoveEnd={({ viewState: { longitude, latitude, zoom } }) => {
          setViewState({ longitude, latitude, zoom });
        }}
        onClick={({ lngLat: { lng, lat } }) => {
          if (activeRoute !== null) {
            // waypoints swallow clicks, so if we get here and there is a selected waypoint, unselect it
            if (activeRoute.selectedWaypointIndex !== null) {
              selectRouteWaypoint(activeRoute.id, null);
            }

            addRouteWaypoint(activeRoute, [lng, lat]);
          }
        }}
        onLoad={({ target: map }) => {
          const demSource = 'mapbox-dem';
          map.addSource(demSource, {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
            maxzoom: 14,
          });
          map.setTerrain({ source: demSource, exaggeration: 1 });
          // Map is ready once the DEM source has been set as the terrain, allowing us to reliable query the terrain elevation with queryTerrainElevation.
          map.once('idle', () => setMapIsReady());
        }}
        cursor={activeRoute !== null && isDragging ? 'grabbing' : 'default'}
      >
        <SlopeAngle />
        <Footpaths />
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
