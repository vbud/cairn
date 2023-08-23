import { Source } from '@/components/map/source';
import { colors } from '@/utils/colors';
import { Map } from 'mapbox-gl';

export function Footpaths({ map }: { map: Map }) {
  return (
    <Source
      map={map}
      id="footpaths"
      options={{
        type: 'vector',
        url: `https://api.maptiler.com/tiles/fd188460-62a3-4e7e-ae64-45bb1d68b400/tiles.json?key=${process.env.NEXT_PUBLIC_MAPTILER_TOKEN}`,
        minzoom: 8,
      }}
      layer={{
        type: 'line',
        'source-layer': 'cawildernesspaths',
        paint: {
          'line-color': colors.brown11,
          'line-dasharray': [3, 3],
          'line-width': [
            'interpolate',
            ['exponential', 1.5],
            ['zoom'],
            8,
            1,
            18,
            7,
          ],
        },
      }}
    />
  );
}
