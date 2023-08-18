import {
  addOverlayToMap,
  changeOverlayOpacity,
  removeOverlayFromMap,
} from '@/app/overlays/overlay-map-methods';
import {
  ActiveRouteId,
  LineString,
  LngLatList,
  MapViewState,
  Overlay,
  OverlayId,
  Overlays,
  Route,
  RouteId,
  Routes,
} from '@/types';
import { produce } from 'immer';
import { Map } from 'mapbox-gl';
import { persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

type PersistedState = {
  mapViewState: MapViewState;
  routes: Routes;
  activeRouteId: ActiveRouteId;
  overlays: Overlays;
};

interface State extends PersistedState {
  // non-persisted state below
  map: Map | null;
  isDragging: boolean;
}

interface Actions {
  setMap: (map: Map) => void;
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
};
const initialState: State = {
  map: null,
  isDragging: false,
  ...initialPersistedState,
};

export const useStore = createWithEqualityFn<State & Actions>()(
  persist(
    (set, get) => ({
      ...initialState,
      setMap: (map) => {
        set(
          produce<State>((state) => {
            state.map = map;
          })
        );
      },
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
      toggleOverlay: (overlayId) => {
        const { map, overlays } = get();
        const nextIsActive = !overlays[overlayId].isActive;
        if (nextIsActive) {
          map && addOverlayToMap(map, overlayId, overlays[overlayId]);
        } else {
          map && removeOverlayFromMap(map, overlayId);
        }

        set(
          produce<State>((state) => {
            state.overlays[overlayId].isActive = nextIsActive;
          })
        );
      },
      changeOverlayOpacity: (overlayId, opacity) => {
        const { map } = get();
        map && changeOverlayOpacity(map, overlayId, opacity);

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
