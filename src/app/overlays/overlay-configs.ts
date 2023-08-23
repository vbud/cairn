import { OverlayId } from '@/types';

const overlayConfigs: {
  id: OverlayId;
  name: string;
  type: 'raster';
  url: string;
  minzoom: number;
  maxzoom: number;
}[] = [
  {
    id: 'slope-angle',
    name: 'Slope angle',
    type: 'raster',
    url: `https://api.maptiler.com/tiles/331f39cf-21e1-4669-8dda-726e3be13c7c/tiles.json?key=${process.env.NEXT_PUBLIC_MAPTILER_TOKEN}`,
    minzoom: 4,
    maxzoom: 14,
  },
];

export default overlayConfigs;
