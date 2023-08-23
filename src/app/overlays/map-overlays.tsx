import { Source } from '@/components/map/source';
import { useStore } from '@/store';
import { OverlayId } from '@/types';
import { Map } from 'mapbox-gl';
import overlayConfigs from './overlay-configs';

export const id: OverlayId = 'slope-angle';

export function MapOverlays({ map }: { map: Map }) {
  const overlays = useStore((s) => s.overlays);
  return overlayConfigs.map(({ id, type, url, minzoom, maxzoom }) => {
    const { isActive, opacity } = overlays[id];
    return isActive ? (
      <Source
        key={id}
        map={map}
        id={id}
        options={{ type, url, minzoom, maxzoom }}
        layer={{
          type,
          paint: {
            'raster-opacity': opacity,
          },
        }}
      />
    ) : null;
  });
}
