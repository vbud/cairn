import { LineString } from '@/store';
import colors from '@/utils/colors';
import type { LineLayer } from 'react-map-gl';
import { Layer, Source } from 'react-map-gl';

const sourceId = 'routePath';
const layer: LineLayer = {
  id: sourceId,
  source: sourceId,
  type: 'line',
  paint: {
    'line-color': colors.plum11,
    'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 15, 2, 18, 7],
  },
};

export default function RoutePath({ geometry }: { geometry: LineString }) {
  return (
    <Source id={sourceId} type="geojson" data={geometry}>
      <Layer {...layer} />
    </Source>
  );
}
