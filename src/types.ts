export type MapViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
};

export type LngLat = [number, number];
export type LngLatList = LngLat[];
export type LineString = {
  type: 'LineString';
  coordinates: LngLatList;
};
export type RouteId = string;
export type Route = {
  id: RouteId;
  name: string;
  waypoints: LngLatList;
  selectedWaypointIndex: number | null;
  pathGeometry: LineString;
};
export type Routes = Record<RouteId, Route>;
export type ActiveRouteId = RouteId | null;

export type OverlayId = 'slope-angle';
export type Overlay = {
  isActive: boolean;
  opacity: number;
};
export type Overlays = Record<OverlayId, Overlay>;
