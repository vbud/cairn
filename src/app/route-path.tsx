import { LineString } from '@/store';
import type { LineLayer } from 'react-map-gl';
import { Layer, Source } from 'react-map-gl';
import colors from './colors';

const sourceId = 'route-path_source';
const layer: LineLayer = {
  id: 'route-path_layer',
  source: sourceId,
  type: 'line',
  paint: {
    'line-color': colors.plum11,
    'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 15, 2, 18, 7],
  },
};

export default function RoutePath({ geojson }: { geojson: LineString }) {
  return (
    <Source id={sourceId} type="geojson" data={geojson}>
      <Layer {...layer} />
    </Source>
  );
}
