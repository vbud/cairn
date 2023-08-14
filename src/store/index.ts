import { produce } from 'immer';
import { persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

type MapViewState = {
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

type RouteId = string;
export type Route = {
  id: RouteId;
  name: string;
  waypoints: LngLatList;
  selectedWaypointIndex: number | null;
  pathGeometry: LineString;
};
type Routes = Record<RouteId, Route>;
type ActiveRouteId = RouteId | null;

export type OverlayId = 'slope-angle';
type Overlay = {
  isActive: boolean;
  opacity: number;
};
type Overlays = Record<OverlayId, Overlay>;

type PersistedState = {
  mapViewState: MapViewState;
  routes: Routes;
  activeRouteId: ActiveRouteId;
  overlays: Overlays;
};

interface State extends PersistedState {
  // non-persisted state below
  isMapReady: boolean;
  isDragging: boolean;
}

interface Actions {
  setMapViewState: (mapViewState: MapViewState) => void;
  setMapIsReady: () => void;
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
  toggleOverlay: (layerId: OverlayId) => void;
  changeOverlayOpacity: (
    layerId: OverlayId,
    opacity: Overlay['opacity']
  ) => void;
}

const initialPersistedState: PersistedState = {
  mapViewState: {
    longitude: -119,
    latitude: 37.27,
    zoom: 5.57,
  },
  routes: {},
  activeRouteId: null,
  overlays: {
    'slope-angle': { isActive: false, opacity: 0.5 },
  },
} as const;
const initialState: State = {
  isDragging: false,
  isMapReady: false,
  ...initialPersistedState,
} as const;

export const useStore = createWithEqualityFn<State & Actions>()(
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
      setMapIsReady: () => {
        set(
          produce<State>((state) => {
            state.isMapReady = true;
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
      toggleOverlay: (overlayId) => {
        set(
          produce<State>((state) => {
            state.overlays[overlayId].isActive =
              !state.overlays[overlayId].isActive;
          })
        );
      },
      changeOverlayOpacity: (overlayId, opacity) => {
        set(
          produce<State>((state) => {
            state.overlays[overlayId].opacity = opacity;
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
        overlays: state.overlays,
      }),
    }
  ),
  shallow
);
