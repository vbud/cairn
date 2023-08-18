'use client';

import { getPathForWaypoints } from '@/api';
import { useStore } from '@/store';
import { LngLat, LngLatList, Route } from '@/types';
import colors from '@/utils/colors';
import mapboxgl, { Map, ScaleControl } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import dynamic from 'next/dynamic';
import { useCallback } from 'react';
import { MapOverlays, OverlayManager } from './overlays';
import styles from './page.module.css';
import RouteDetails from './route-details';
import Routes from './routes';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

function App() {
  const [
    map,
    mapViewState,
    activeRoute,
    isDragging,
    setViewState,
    setMap,
    setRouteWaypoints,
    setRoutePathGeometry,
    selectRouteWaypoint,
  ] = useStore((s) => [
    s.map,
    s.mapViewState,
    s.activeRouteId === null ? null : s.routes[s.activeRouteId],
    s.isDragging,
    s.setMapViewState,
    s.setMap,
    s.setRouteWaypoints,
    s.setRoutePathGeometry,
    s.selectRouteWaypoint,
  ]);

  const initializeMap = useCallback((node: HTMLDivElement) => {
    if (node) {
      const { longitude, latitude, zoom } = mapViewState;

      const map = new Map({
        container: node,
        style: 'mapbox://styles/vbud/clk0647oh002j01rjc69z9o6k',
        center: [longitude, latitude],
        zoom: zoom,
      });

      const scale = new ScaleControl({
        maxWidth: 80,
        unit: 'imperial',
      });
      map.addControl(scale);

      map.on('load', () => {
        // tiles that allow us to see trails at lower zoom levels
        const trailsSource = 'trails';
        map.addSource(trailsSource, {
          type: 'vector',
          url: `https://api.maptiler.com/tiles/fd188460-62a3-4e7e-ae64-45bb1d68b400/tiles.json?key=${process.env.NEXT_PUBLIC_MAPTILER_TOKEN}`,
          minzoom: 8,
        });
        map.addLayer({
          id: trailsSource,
          source: trailsSource,
          type: 'line',
          'source-layer': 'cawildernesspaths',
          paint: {
            'line-color': colors.brown11,
            'line-dasharray': [3, 3],
            'line-width': [
              'interpolate',
              ['exponential', 1.5],
              ['zoom'],
              8,
              1,
              18,
              7,
            ],
          },
        });

        // DEM tiles
        const demSource = 'mapbox-dem';
        map.addSource(demSource, {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14,
        });
        map.setTerrain({ source: demSource, exaggeration: 1 });

        // Map is ready once the DEM source has been set as the terrain, allowing us to reliably query the terrain elevation with queryTerrainElevation.
        map.once('idle', () => setMap(map));
      });

      map.on('moveend', () => {
        const { lng, lat } = map.getCenter();
        const zoom = map.getZoom();
        setViewState({ longitude: lng, latitude: lat, zoom });
      });
    } else {
      map?.remove();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addRouteWaypoint(route: Route, lngLat: LngLat) {
    const newWaypoints: LngLatList = [...route.waypoints, lngLat];
    setRouteWaypoints(route.id, newWaypoints);
    selectRouteWaypoint(route.id, newWaypoints.length - 1);
    const newPath = await getPathForWaypoints(newWaypoints);
    if (newPath !== null) setRoutePathGeometry(route.id, newPath);
  }

  return (
    <main className={styles.root}>
      <div className={styles.leftPanel}>
        {activeRoute === null ? (
          <Routes />
        ) : (
          <RouteDetails route={activeRoute} />
        )}
        <OverlayManager />
      </div>
      <div className={styles.mapContainer} ref={initializeMap} />
      {/* TODO: keep this approach or pull in react-map-gl components? */}
      {map && <MapOverlays map={map} />}
    </main>
  );
}

// Disable SSR application-wide
const NonSSRApp = dynamic(() => Promise.resolve(App), {
  ssr: false,
});

export default NonSSRApp;
/* 
function OldMap() {
  return (
    <Map
      onClick={({ lngLat: { lng, lat } }) => {
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
      {activeRoute !== null && (
        <RoutePath geometry={activeRoute.pathGeometry} />
      )}
      {activeRoute !== null && <Waypoints route={activeRoute} />}
    </Map>
  );
}
 */
