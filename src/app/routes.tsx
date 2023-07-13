'use client';

import { Route, shallow, useStore } from '@/store';
import { Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import cx from 'classNames';
import { useState } from 'react';
import styles from './routes.module.css';

function Route({ id, name }: { id: Route['id']; name: Route['name'] }) {
  const [activeRouteId, selectRoute, renameRoute, deleteRoute] = useStore(
    (s) => [s.activeRouteId, s.selectRoute, s.renameRoute, s.deleteRoute],
    shallow
  );

  const [isRenaming, setIsRenaming] = useState(false);

  return (
    <div
      key={id}
      className={cx(styles.route, {
        [styles.activeRoute]: activeRouteId === id,
      })}
      onClick={(e) => {
        e.stopPropagation();
        selectRoute(id);
      }}
    >
      {isRenaming ? (
        <input
          autoFocus
          defaultValue={name}
          onBlur={() => setIsRenaming(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              renameRoute(id, (e.target as HTMLInputElement).value);
              setIsRenaming(false);
            } else if (e.key === 'Escape') {
              setIsRenaming(false);
            }
          }}
        />
      ) : (
        name
      )}
      <div className={styles.routeControls}>
        <Pencil1Icon
          onClick={(e) => {
            e.stopPropagation();
            setIsRenaming(true);
          }}
        />
        <TrashIcon
          onClick={(e) => {
            e.stopPropagation();
            deleteRoute(id);
          }}
        />
      </div>
    </div>
  );
}

export default function Routes() {
  const [routes, createRoute, selectRoute] = useStore(
    (s) => [s.routes, s.createRoute, s.selectRoute],
    shallow
  );

  return (
    <div className={styles.root} onClick={() => selectRoute(null)}>
      <h1>Routes</h1>
      <div className={styles.routeList}>
        {Object.keys(routes).length > 0
          ? Object.values(routes).map(({ id, name }) => (
              <Route key={id} id={id} name={name} />
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
