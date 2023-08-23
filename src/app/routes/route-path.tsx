import { Source } from '@/components/map/source';
import { LineString } from '@/types';
import { colors } from '@/utils';
import { Map } from 'mapbox-gl';

export function RoutePath({
  map,
  geometry,
}: {
  map: Map;
  geometry: LineString;
}) {
  return (
    <Source
      map={map}
      id="routePath"
      options={{ type: 'geojson', data: geometry }}
      layer={{
        type: 'line',
        paint: {
          'line-color': colors.plum11,
          'line-width': [
            'interpolate',
            ['exponential', 1.5],
            ['zoom'],
            15,
            2,
            18,
            7,
          ],
        },
      }}
    />
  );
}
