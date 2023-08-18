import { useStore } from '@/store';
import { OverlayId } from '@/types';
import { objectEntries } from '@/utils/object';
import { Map } from 'mapbox-gl';
import { useEffect } from 'react';
import { addOverlayToMap, removeOverlayFromMap } from './overlay-map-methods';

export const id: OverlayId = 'slope-angle';

export function MapOverlays({ map }: { map: Map }) {
  const [overlays] = useStore((s) => [s.overlays]);

  useEffect(() => {
    objectEntries(overlays).map(([id, overlay]) => {
      if (overlay.isActive) {
        addOverlayToMap(map, id, overlay);
      }
    });

    return () => {
      objectEntries(overlays).map(([id, { isActive }]) => {
        if (isActive) {
          removeOverlayFromMap(map, id);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
