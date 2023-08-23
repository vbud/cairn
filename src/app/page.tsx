'use client';

import { Map } from '@/app/map';
import { useStore } from '@/store';
import 'mapbox-gl/dist/mapbox-gl.css';
import dynamic from 'next/dynamic';
import { OverlayManager } from './overlays';
import styles from './page.module.css';
import { RouteDetails, RouteList } from './routes';

function App() {
  const activeRoute = useStore((s) =>
    s.activeRouteId === null ? null : s.routes[s.activeRouteId]
  );

  return (
    <main className={styles.root}>
      <div className={styles.leftPanel}>
        {activeRoute === null ? (
          <RouteList />
        ) : (
          <RouteDetails route={activeRoute} />
        )}
        <OverlayManager />
      </div>
      <Map />
    </main>
  );
}

// Disable SSR application-wide
const NonSSRApp = dynamic(() => Promise.resolve(App), {
  ssr: false,
});

export default NonSSRApp;
