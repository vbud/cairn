import { LineString, LngLatList } from '@/types';

type AbortableFetch = { abort: () => void; ready: ReturnType<typeof fetch> };
function abortableFetch(
  request: Parameters<typeof fetch>[0],
  opts?: Parameters<typeof fetch>[1]
) {
  const controller = new AbortController();
  const signal = controller.signal;

  return {
    abort: () => controller.abort(),
    ready: fetch(request, { ...opts, signal }),
  };
}

let pendingPathRequest: AbortableFetch | null = null;

export async function getPathForWaypoints(
  routeWaypoints: LngLatList
): Promise<LineString | null> {
  if (pendingPathRequest) {
    pendingPathRequest.abort();
  }
  if (Object.keys(routeWaypoints).length < 2)
    return { type: 'LineString', coordinates: [] };

  const routeWaypointsSerialized = routeWaypoints
    .map((waypoint) => waypoint.join(','))
    .join(';');

  try {
    pendingPathRequest = abortableFetch(
      `https://api.mapbox.com/directions/v5/mapbox/walking/${routeWaypointsSerialized}?overview=full&geometries=geojson&steps=false&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
    );
    const res = await pendingPathRequest.ready;

    pendingPathRequest = null;

    const data = await res.json();
    return data.routes[0].geometry;
  } catch (err) {
    pendingPathRequest = null;

    if (err instanceof DOMException && err.name === 'AbortError') {
      // Request aborted, do not log the error.
    } else {
      console.error(err);
    }

    return null;
  }
}
