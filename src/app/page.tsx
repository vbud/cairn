'use client';
import 'client-only';

import { shallow, useStore } from '@/store';
import 'mapbox-gl/dist/mapbox-gl.css';
import Map, { ScaleControl } from 'react-map-gl';
import mapStyle from './map-style.json';
import styles from './page.module.css';

export default function Home() {
  const [mapViewState, setViewState] = useStore(
    (s) => [s.mapViewState, s.setMapViewState],
    shallow
  );

  return (
    <main className={styles.main}>
      <Map
        reuseMaps
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        mapLib={import('mapbox-gl')}
        // @ts-ignore
        mapStyle={mapStyle}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        initialViewState={mapViewState}
        onMoveEnd={({ viewState: { longitude, latitude, zoom } }) => {
          setViewState({ longitude, latitude, zoom });
        }}
      >
        <ScaleControl unit="imperial" />
      </Map>
    </main>
  );
}
