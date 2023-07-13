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

const PersistedState = z.object({
  mapViewState: MapViewState,
});
type PersistedState = z.infer<typeof PersistedState>;

interface State extends PersistedState {}

interface Actions {
  setMapViewState: (mapViewState: MapViewState) => void;
}

const initialPersistedState: PersistedState = {
  mapViewState: {
    longitude: -119,
    latitude: 37.27,
    zoom: 5.57,
  },
} as const;
const initialState: State = {
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
    }),
    {
      name: 'cairn-storage',
      partialize: (state) => ({
        mapViewState: state.mapViewState,
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
