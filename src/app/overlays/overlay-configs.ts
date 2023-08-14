import { OverlayId } from '@/store';

const overlayConfigs: {
  id: OverlayId;
  name: string;
  type: 'raster';
  url: string;
  minZoom: number;
  maxZoom: number;
}[] = [
  {
    id: 'slope-angle',
    name: 'Slope angle',
    type: 'raster',
    url: `https://api.maptiler.com/tiles/331f39cf-21e1-4669-8dda-726e3be13c7c/tiles.json?key=${process.env.NEXT_PUBLIC_MAPTILER_TOKEN}`,
    minZoom: 4,
    maxZoom: 14,
  },
];

export default overlayConfigs;
