import { getPathForWaypoints } from '@/api';
import { MapOverlays } from '@/app/overlays';
import { RoutePath, RouteWaypoints } from '@/app/routes';
import { LngLat, LngLatList, Route, useStore } from '@/store';
import { Map as MapboxMap, ScaleControl } from 'mapbox-gl';
import { createContext, useCallback } from 'react';
import { Footpaths } from './footpaths';
import styles from './index.module.css';

export const MapContext = createContext<MapboxMap | null>(null);

export function Map() {
  const [
    mapViewState,
    setMapViewState,
    map,
    setMap,
    setRouteWaypoints,
    setRoutePathGeometry,
    selectRouteWaypoint,
    activeRoute,
  ] = useStore((s) => [
    s.mapViewState,
    s.setMapViewState,
    s.map,
    s.setMap,
    s.setRouteWaypoints,
    s.setRoutePathGeometry,
    s.selectRouteWaypoint,
    // TODO: share this selector and the logic
    s.activeRouteId === null ? null : s.routes[s.activeRouteId],
  ]);

  async function addRouteWaypoint(route: Route, lngLat: LngLat) {
    const newWaypoints: LngLatList = [...route.waypoints, lngLat];
    setRouteWaypoints(route.id, newWaypoints);
    selectRouteWaypoint(route.id, newWaypoints.length - 1);
    const newPath = await getPathForWaypoints(newWaypoints);
    if (newPath !== null) setRoutePathGeometry(route.id, newPath);
  }

  const mountMap = useCallback((node: HTMLDivElement) => {
    if (node) {
      const { longitude, latitude, zoom } = mapViewState;

      const map = new MapboxMap({
        accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
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
        const { lng: longitude, lat: latitude } = map.getCenter();
        const zoom = map.getZoom();
        setMapViewState({ longitude, latitude, zoom });
      });

      map.on('click', () => {
        const { lng, lat } = map.getCenter();

        // We are outside of react in this callback, so we need to get the latest state
        const s = useStore.getState();
        const activeRoute =
          s.activeRouteId === null ? null : s.routes[s.activeRouteId];
        if (activeRoute !== null) {
          // waypoints swallow clicks, so if we get here and there is a selected waypoint, unselect it
          if (activeRoute.selectedWaypointIndex !== null) {
            selectRouteWaypoint(activeRoute.id, null);
          }

          addRouteWaypoint(activeRoute, [lng, lat]);
        }
      });

      // TODO: port cursor code below
      // cursor={activeRoute !== null && isDragging ? 'grabbing' : 'default'}
    }

    return () => {
      map?.remove();
      setMap(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.map} ref={mountMap}>
      <MapOverlays />
      <Footpaths />
      {activeRoute !== null && (
        <RoutePath geometry={activeRoute.pathGeometry} />
      )}
      {activeRoute !== null && <RouteWaypoints route={activeRoute} />}
    </div>
  );
}
