import { LineString, LngLatList } from '@/store';

export async function getPathForWaypoints(
  routeWaypoints: LngLatList
): Promise<LineString> {
  if (Object.keys(routeWaypoints).length < 2)
    return { type: 'LineString', coordinates: [] };

  const routeWaypointsSerialized = routeWaypoints
    .map((waypoint) => waypoint.join(','))
    .join(';');

  try {
    const res = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/walking/${routeWaypointsSerialized}?overview=full&geometries=geojson&steps=false&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
    );
    const data = await res.json();
    return data.routes[0].geometry;
  } catch (err) {
    console.error(err);
    return { type: 'LineString', coordinates: [] };
  }
}
