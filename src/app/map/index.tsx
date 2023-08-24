import { getPathForWaypoints } from '@/api';
import { MapOverlays } from '@/app/overlays';
import { RoutePath, RouteWaypoints } from '@/app/routes';
import { useStore } from '@/store';
import { LngLat, LngLatList, Route } from '@/types';
import { Map as MapboxMap, ScaleControl } from 'mapbox-gl';
import { useCallback } from 'react';
import { Footpaths } from './footpaths';
import styles from './index.module.css';

export function Map() {
  const [
    map,
    setMap,
    setMapViewState,
    setRouteWaypoints,
    setRoutePathGeometry,
    selectRouteWaypoint,
    activeRoute,
  ] = useStore((s) => [
    s.map,
    s.setMap,
    s.setMapViewState,
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
      // We only need the mapViewState when the map loads, so only select it once here, rather than with the rest of the selectors, to avoid unnecessary re-renders.
      const { mapViewState } = useStore.getState();
      const { longitude, latitude, zoom } = mapViewState;

      const map = new MapboxMap({
        accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
        container: node,
        style: 'mapbox://styles/vbud/clk0647oh002j01rjc69z9o6k',
        center: [longitude, latitude],
        zoom: zoom,
      });

      map.getCanvas().style.cursor = 'auto';

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

      map.on('click', (e) => {
        // We are outside of react in this callback, so we need to get the latest state
        const s = useStore.getState();
        // TODO: share
        const activeRoute =
          s.activeRouteId === null ? null : s.routes[s.activeRouteId];
        if (activeRoute !== null) {
          // waypoints swallow clicks, so if we get here and there is a selected waypoint, unselect it
          if (activeRoute.selectedWaypointIndex !== null) {
            selectRouteWaypoint(activeRoute.id, null);
          }

          const { lng, lat } = e.lngLat;
          addRouteWaypoint(activeRoute, [lng, lat]);
        }
      });
    }

    return () => {
      map?.remove();
      setMap(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.map} ref={mountMap}>
      {map && (
        <>
          <MapOverlays map={map} />
          <Footpaths map={map} />
          {activeRoute && (
            <RoutePath map={map} geometry={activeRoute.pathGeometry} />
          )}
          {activeRoute && <RouteWaypoints map={map} route={activeRoute} />}
        </>
      )}
    </div>
  );
}
