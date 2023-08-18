import { Overlay, OverlayId } from '@/types';
import { Map } from 'mapbox-gl';
import { overlayConfigs } from './overlay-configs';

export function addOverlayToMap(map: Map, id: OverlayId, { opacity }: Overlay) {
  const { type, url, minZoom, maxZoom } = overlayConfigs[id];
  map.addSource(id, {
    type,
    url,
    minzoom: minZoom,
    maxzoom: maxZoom,
  });
  map.addLayer({
    id,
    source: id,
    type,
    paint: {
      'raster-opacity': opacity,
    },
  });
}

export function removeOverlayFromMap(map: Map, id: OverlayId) {
  map.removeLayer(id);
  map.removeSource(id);
}

export function changeOverlayOpacity(map: Map, id: OverlayId, opacity: number) {
  map.setPaintProperty(id, 'raster-opacity', opacity);
}
