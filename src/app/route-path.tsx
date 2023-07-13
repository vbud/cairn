import { LineString } from '@/store';
import type { LineLayer } from 'react-map-gl';
import { Layer, Source } from 'react-map-gl';

const layer: LineLayer = {
  id: 'routePath_layer',
  source: 'cairn',
  type: 'line',
  paint: {
    'line-color': 'hsl(292, 60.0%, 42.5%)',
    'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 15, 2, 18, 7],
  },
};

export default function RoutePath({ geometry }: { geometry: LineString }) {
  return (
    <Source id="routePath_source" type="geojson" data={geometry}>
      <Layer {...layer} />
    </Source>
  );
}
