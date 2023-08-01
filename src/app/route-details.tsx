import { LngLatList, Route, shallow, useStore } from '@/store';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import classNames from 'classnames';
import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { getPathForWaypoints } from './api';
import IconButton from './icon-button';
import RouteControls from './route-controls';
import styles from './route-details.module.css';

export default function RouteDetails({ route }: { route: Route }) {
  const [
    selectRoute,
    renameRoute,
    deleteRoute,
    selectRouteWaypoint,
    setRouteWaypoints,
    setRoutePathGeometry,
  ] = useStore(
    (s) => [
      s.selectRoute,
      s.renameRoute,
      s.deleteRoute,
      s.selectRouteWaypoint,
      s.setRouteWaypoints,
      s.setRoutePathGeometry,
    ],
    shallow
  );

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
    <div className={styles.root}>
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
          route.name
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
    </div>
  );
}
