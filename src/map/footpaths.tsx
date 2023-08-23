import colors from '@/utils/colors';
import type { LineLayer } from 'react-map-gl';
import { Layer, Source } from 'react-map-gl';

const sourceId = 'footpaths';
const layer: LineLayer = {
  id: sourceId,
  source: sourceId,
  type: 'line',
  'source-layer': 'cawildernesspaths',
  paint: {
    'line-color': colors.brown11,
    'line-dasharray': [3, 3],
    'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 8, 1, 18, 7],
  },
};

export function Footpaths() {
  return (
    <Source
      id={sourceId}
      type="vector"
      url={`https://api.maptiler.com/tiles/fd188460-62a3-4e7e-ae64-45bb1d68b400/tiles.json?key=${process.env.NEXT_PUBLIC_MAPTILER_TOKEN}`}
      minzoom={8}
    >
      <Layer {...layer} />
    </Source>
  );
}
