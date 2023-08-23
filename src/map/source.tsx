import assert from '@/utils/assert';
import { deepEqual } from '@/utils/deep-equal';
import { useEffect, useRef } from 'react';

import { useStore } from '@/store';
import { AnySourceData, AnySourceImpl, Map } from 'mapbox-gl';

export type SourceProps = {
  id: string;
  options: AnySourceData;
};

function createSource(map: Map, id: string, options: AnySourceData) {
  map.addSource(id, options);
  return map.getSource(id);
}

function updateSource(
  source: AnySourceImpl,
  options: AnySourceData,
  prevOptions: AnySourceData
) {
  assert(options.type === prevOptions.type, 'source type cannot be changed');

  const changedKeys: Record<string, boolean> = {};
  let changedKeyCount = 0;

  Object.keys(options).forEach((k) => {
    const key = k as keyof AnySourceData;
    if (!deepEqual(prevOptions[key], options[key])) {
      changedKeys[key] = true;
      changedKeyCount++;
    }
  });

  if (!changedKeyCount) {
    return;
  }

  if (
    options.type === 'geojson' &&
    source.type === 'geojson' &&
    changedKeys.data &&
    options.data !== undefined
  ) {
    // @ts-ignore
    source.setData(options.data);
  }
}

export function Source(props: SourceProps) {
  const map = useStore((s) => s.map);
  const prevOptionsRef = useRef(props.options);

  const { id } = props;

  useEffect(() => {
    return () => {
      if (map && map.getSource(id)) {
        // Source can only be removed after all child layers are removed
        const allLayers = map.getStyle().layers;
        if (allLayers) {
          for (const layer of allLayers) {
            // @ts-ignore
            if (layer.source === id) {
              map.removeLayer(layer.id);
            }
          }
        }
        map.removeSource(id);
      }
    };
  }, [map]);

  if (!map) return null;

  const source = map.getSource(id);
  if (source) {
    updateSource(source, props.options, prevOptionsRef.current);
  } else {
    createSource(map, id, props.options);
  }
  prevOptionsRef.current = props.options;

  return null;
}
