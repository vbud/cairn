import { getPathForWaypoints } from '@/api';
import IconButton from '@/components/icon-button';
import { LngLatList, Route, useStore } from '@/store';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import classNames from 'classnames';
import { RefObject, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { MapRef } from 'react-map-gl';
import ElevationProfile from './elevation-profile';
import styles from './index.module.css';
import RouteControls from './route-controls';

export default function RouteDetails({
  route,
  mapRef,
}: {
  route: Route;
  mapRef: RefObject<MapRef>;
}) {
  const [
    isMapReady,
    selectRoute,
    renameRoute,
    deleteRoute,
    selectRouteWaypoint,
    setRouteWaypoints,
    setRoutePathGeometry,
  ] = useStore((s) => [
    s.isMapReady,
    s.selectRoute,
    s.renameRoute,
    s.deleteRoute,
    s.selectRouteWaypoint,
    s.setRouteWaypoints,
    s.setRoutePathGeometry,
  ]);

  const [isRenaming, setIsRenaming] = useState(false);

  async function removeRouteWaypoint(route: Route, waypointIndex: number) {
    const newWaypoints: LngLatList = [...route.waypoints];

    if (newWaypoints.length > 0) {
      // Select the previous waypoint. If there is no previous waypoint, select the first waypoint.
      selectRouteWaypoint(route.id, Math.max(waypointIndex - 1, 0));
    } else {
      selectRouteWaypoint(route.id, null);
    }

    newWaypoints.splice(waypointIndex, 1);
    setRouteWaypoints(route.id, newWaypoints);
    const newPath = await getPathForWaypoints(newWaypoints);
    if (newPath !== null) setRoutePathGeometry(route.id, newPath);
  }

  useHotkeys('meta+backspace', () => deleteRoute(route.id));
  useHotkeys('backspace', () => {
    if (route.selectedWaypointIndex !== null)
      removeRouteWaypoint(route, route.selectedWaypointIndex);
  });

  return (
    <div>
      <div className={styles.routeToolbar}>
        <IconButton icon={ArrowLeftIcon} onClick={() => selectRoute(null)} />
        <RouteControls
          route={route}
          triggerRename={() => setIsRenaming(true)}
        />
      </div>
      <div className={styles.routeName}>
        {isRenaming ? (
          <input
            className={styles.nameInput}
            autoFocus
            defaultValue={route.name}
            onBlur={() => setIsRenaming(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                renameRoute(route.id, (e.target as HTMLInputElement).value);
                setIsRenaming(false);
              } else if (e.key === 'Escape') {
                setIsRenaming(false);
              }
            }}
          />
        ) : (
          <h2>{route.name}</h2>
        )}
      </div>

      <div className={styles.waypointsList}>
        {route.waypoints.map((_, i) => (
          <div
            key={i}
            className={classNames(styles.waypoint, {
              [styles.selectedWaypoint]: route.selectedWaypointIndex === i,
            })}
            onClick={() => selectRouteWaypoint(route.id, i)}
          >
            Waypoint {i}
          </div>
        ))}
      </div>

      {/* Wait for map to be ready so that ElevationProfile can use queryTerrainElevation. */}
      {isMapReady && mapRef.current && (
        <ElevationProfile
          routeCoordinates={route.pathGeometry.coordinates}
          map={mapRef.current}
        />
      )}
    </div>
  );
}
