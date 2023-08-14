import { OverlayId, useStore } from '@/store';
import { Layer, Source } from 'react-map-gl';
import overlayConfigs from './overlay-configs';

export const id: OverlayId = 'slope-angle';

export function MapOverlays() {
  const [overlays] = useStore((s) => [s.overlays]);
  return overlayConfigs.map(({ id, type, url, minZoom, maxZoom }) => {
    const { isActive, opacity } = overlays[id];
    return isActive ? (
      <Source
        key={id}
        id={id}
        type={type}
        url={url}
        minzoom={minZoom}
        maxzoom={maxZoom}
      >
        <Layer
          id={id}
          source={id}
          type={type}
          paint={{
            'raster-opacity': opacity,
          }}
        />
      </Source>
    ) : null;
  });
}
