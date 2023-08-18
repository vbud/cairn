'use client';

import { Route as RouteListItem, useStore } from '@/store';
import { useHotkeys } from 'react-hotkeys-hook';
import styles from './index.module.css';

function RouteListItem({ route }: { route: RouteListItem }) {
  const { id, name } = route;
  const [selectRoute] = useStore((s) => [s.selectRoute]);

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

export function RouteList() {
  const [routes, createRoute, selectRoute] = useStore((s) => [
    s.routes,
    s.createRoute,
    s.selectRoute,
  ]);

  useHotkeys('r', () => createRoute());

  return (
    <div onClick={() => selectRoute(null)}>
      <h1>Routes</h1>
      <div className={styles.routeList}>
        {Object.keys(routes).length > 0
          ? Object.values(routes).map((route) => (
              <RouteListItem key={route.id} route={route} />
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
