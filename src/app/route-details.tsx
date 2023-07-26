import { Route, shallow, useStore } from '@/store';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import classNames from 'classnames';
import { useState } from 'react';
import IconButton from './icon-button';
import RouteControls from './route-controls';
import styles from './route-details.module.css';

export default function RouteDetails({ route }: { route: Route }) {
  const [selectRoute, renameRoute, selectRouteWaypoint] = useStore(
    (s) => [s.selectRoute, s.renameRoute, s.selectRouteWaypoint],
    shallow
  );

  const [isRenaming, setIsRenaming] = useState(false);

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
