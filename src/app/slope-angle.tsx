import type { RasterLayer } from 'react-map-gl';
import { Layer, Source } from 'react-map-gl';

const sourceId = 'slope-angle';
const layer: RasterLayer = {
  id: sourceId,
  source: sourceId,
  type: 'raster',
  paint: {
    'raster-opacity': 0.5,
  },
};

export default function SlopeAngle() {
  return (
    <Source
      id={sourceId}
      type="raster"
      url={`https://api.maptiler.com/tiles/331f39cf-21e1-4669-8dda-726e3be13c7c/tiles.json?key=${process.env.NEXT_PUBLIC_MAPTILER_TOKEN}`}
      minzoom={4}
      maxzoom={14}
    >
      <Layer {...layer} />
    </Source>
  );
}
