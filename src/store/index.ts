import { produce } from 'immer';
import { z } from 'zod';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export { shallow } from 'zustand/shallow';

const MapViewState = z.object({
  longitude: z.number(),
  latitude: z.number(),
  zoom: z.number().min(0).max(22),
});
type MapViewState = z.infer<typeof MapViewState>;

const LngLat = z.tuple([z.number(), z.number()]);
export type LngLat = z.infer<typeof LngLat>;
const LngLatList = z.array(LngLat);
export type LngLatList = z.infer<typeof LngLatList>;
const LineString = z.object({
  type: z.literal('LineString'),
  coordinates: LngLatList,
});
export type LineString = z.infer<typeof LineString>;

const RouteId = z.string();
export type RouteId = z.infer<typeof RouteId>;
const Route = z.object({
  id: RouteId,
  name: z.string(),
  waypoints: LngLatList,
  selectedWaypointIndex: z.number().nullable(),
  pathGeometry: LineString,
});
export type Route = z.infer<typeof Route>;
const Routes = z.record(z.string(), Route);
type Routes = z.infer<typeof Routes>;
const ActiveRouteId = RouteId.nullable();
type ActiveRouteId = z.infer<typeof ActiveRouteId>;

const PersistedState = z.object({
  mapViewState: MapViewState,
  routes: Routes,
  activeRouteId: ActiveRouteId,
});
type PersistedState = z.infer<typeof PersistedState>;

interface State extends PersistedState {
  isDragging: boolean;
}

interface Actions {
  setMapViewState: (mapViewState: MapViewState) => void;
  createRoute: () => void;
  selectRoute: (routeId: ActiveRouteId) => void;
  renameRoute: (routeId: RouteId, name: Route['id']) => void;
  deleteRoute: (routeId: RouteId) => void;
  setRouteWaypoints: (routeId: RouteId, waypoints: LngLatList) => void;
  setRoutePathGeometry: (routeId: RouteId, pathGeometry: LineString) => void;
  selectRouteWaypoint: (
    routeId: RouteId,
    waypointIndex: Route['selectedWaypointIndex']
  ) => void;
  startDraggingWaypoint: () => void;
  stopDraggingWaypoint: () => void;
}

const initialPersistedState: PersistedState = {
  mapViewState: {
    longitude: -119,
    latitude: 37.27,
    zoom: 5.57,
  },
  routes: {},
  activeRouteId: null,
} as const;
const initialState: State = {
  isDragging: false,
  ...initialPersistedState,
} as const;

export const useStore = create<State & Actions>()(
  persist(
    (set) => ({
      ...initialState,
      setMapViewState: (mapViewState) => {
        set(
          produce<State>((state) => {
            state.mapViewState = mapViewState;
          })
        );
      },
      createRoute: () => {
        set(
          produce<State>((state) => {
            const newRoute: Route = {
              id: crypto.randomUUID(),
              name: 'New route',
              waypoints: [],
              selectedWaypointIndex: null,
              pathGeometry: { type: 'LineString', coordinates: [] },
            };
            state.routes[newRoute.id] = newRoute;
            state.activeRouteId = newRoute.id;
          })
        );
      },
      selectRoute: (routeId) => {
        set(
          produce<State>((state) => {
            state.activeRouteId = routeId;
          })
        );
      },
      renameRoute: (routeId, name) => {
        set(
          produce<State>((state) => {
            state.routes[routeId].name = name;
          })
        );
      },
      deleteRoute: (routeId) => {
        set(
          produce<State>((state) => {
            if (routeId === state.activeRouteId) {
              state.activeRouteId = null;
            }
            delete state.routes[routeId];
          })
        );
      },
      setRouteWaypoints: (routeId, waypoints) => {
        set(
          produce<State>((state) => {
            state.routes[routeId].waypoints = waypoints;
          })
        );
      },
      setRoutePathGeometry: (routeId, pathGeometry) => {
        set(
          produce<State>((state) => {
            state.routes[routeId].pathGeometry = pathGeometry;
          })
        );
      },
      selectRouteWaypoint: (routeId, waypointIndex) => {
        set(
          produce<State>((state) => {
            state.routes[routeId].selectedWaypointIndex = waypointIndex;
          })
        );
      },
      startDraggingWaypoint: () => {
        set(
          produce<State>((state) => {
            state.isDragging = true;
          })
        );
      },
      stopDraggingWaypoint: () => {
        set(
          produce<State>((state) => {
            state.isDragging = false;
          })
        );
      },
    }),
    {
      name: 'cairn-storage',
      partialize: (state) => ({
        mapViewState: state.mapViewState,
        routes: state.routes,
        activeRouteId: state.activeRouteId,
      }),
      merge: (persistedStateUnvalidated, currentState) => {
        let persistedState: PersistedState = initialPersistedState;
        const result = PersistedState.safeParse(persistedStateUnvalidated);
        if (result.success) {
          persistedState = result.data;
        }

        return {
          ...currentState,
          ...persistedState,
        };
      },
    }
  )
);
