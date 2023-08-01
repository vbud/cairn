'use client';

import { Route, shallow, useStore } from '@/store';
import { useHotkeys } from 'react-hotkeys-hook';
import styles from './routes.module.css';

function Route({ route }: { route: Route }) {
  const { id, name } = route;
  const [selectRoute] = useStore((s) => [s.selectRoute], shallow);

  return (
    <div
      key={id}
      className={styles.route}
      onClick={(e) => {
        e.stopPropagation();
        selectRoute(id);
      }}
    >
      {name}
    </div>
  );
}

export default function Routes() {
  const [routes, createRoute, selectRoute] = useStore(
    (s) => [s.routes, s.createRoute, s.selectRoute],
    shallow
  );

  useHotkeys('r', () => createRoute());

  return (
    <div className={styles.root} onClick={() => selectRoute(null)}>
      <h1>Routes</h1>
      <div className={styles.routeList}>
        {Object.keys(routes).length > 0
          ? Object.values(routes).map((route) => (
              <Route key={route.id} route={route} />
            ))
          : 'No routes have been created.'}
      </div>
      <button
        className={styles.createRoute}
        onClick={(e) => {
          e.stopPropagation();
          createRoute();
        }}
      >
        Create route
      </button>
    </div>
  );
}
