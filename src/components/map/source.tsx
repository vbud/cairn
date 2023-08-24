import {
  AnyLayout,
  AnyPaint,
  GeoJSONSource,
  GeoJSONSourceRaw,
  LineLayer,
  Map,
  RasterLayer,
  RasterSource,
  VectorSource,
} from 'mapbox-gl';
import { useEffect, useRef } from 'react';

import { assert, deepEqual } from '@/utils';

type OmitUnion<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

type AnySourceData = GeoJSONSourceRaw | RasterSource | VectorSource;
type AnySource = GeoJSONSource | RasterSource;
type AnyLayer = OmitUnion<LineLayer | RasterLayer, 'source' | 'id'>;

type Props = {
  map: Map;
  id: string;
  options: AnySourceData;
  layer: AnyLayer;
};
export function Source({ map, id, options, layer }: Props) {
  const prevOptionsRef = useRef(options);
  const prevLayerRef = useRef(layer);

  useEffect(() => {
    return () => {
      // Layer must be removed before the source
      map.getLayer(id) && map.removeLayer(id);
      map.getSource(id) && map.removeSource(id);
    };
  }, []);

  const existingSource = map.getSource(id) as AnySource;
  if (existingSource) {
    updateSource(existingSource, options, prevOptionsRef.current);
  } else {
    addSource(map, id, options);
  }
  prevOptionsRef.current = options;

  const existingLayer = map.getLayer(id);
  if (existingLayer) {
    updateLayer(map, id, layer, prevLayerRef.current);
  } else {
    addLayer(map, id, layer);
  }
  prevLayerRef.current = layer;

  return null;
}

function addSource(map: Map, id: string, options: AnySourceData) {
  map.addSource(id, options);
}

function updateSource(
  source: AnySource,
  options: AnySourceData,
  prevOptions: AnySourceData
) {
  assert(options.type === prevOptions.type, 'source type cannot be changed');

  const changedKeys: Record<string, boolean> = {};
  let changedKeyCount = 0;

  for (const k in options) {
    const key = k as keyof AnySourceData;
    if (!deepEqual(prevOptions[key], options[key])) {
      changedKeys[key] = true;
      changedKeyCount++;
    }
  }

  if (changedKeyCount === 0) {
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

function addLayer(map: Map, id: string, layer: AnyLayer) {
  map.addLayer({ ...layer, id, source: id });
}

function updateLayer(
  map: Map,
  id: string,
  layer: AnyLayer,
  prevLayer: AnyLayer
) {
  assert(layer.type === prevLayer.type, 'layer type cannot be changed');

  const { layout = {}, paint = {}, filter, minzoom, maxzoom } = layer;

  if (layout !== prevLayer.layout) {
    const prevLayout = prevLayer.layout || {};
    for (const k in layout) {
      const key = k as keyof AnyLayout;
      if (!deepEqual(layout[key], prevLayout[key])) {
        map.setLayoutProperty(id, key, layout[key]);
      }
    }
    for (const key in prevLayout) {
      if (!layout.hasOwnProperty(key)) {
        map.setLayoutProperty(id, key, undefined);
      }
    }
  }
  if (paint !== prevLayer.paint) {
    const prevPaint = prevLayer.paint || {};
    for (const k in paint) {
      const key = k as keyof AnyPaint;
      if (!deepEqual(paint[key], prevPaint[key])) {
        map.setPaintProperty(id, key, paint[key]);
      }
    }
    for (const key in prevPaint) {
      if (!paint.hasOwnProperty(key)) {
        map.setPaintProperty(id, key, undefined);
      }
    }
  }

  if (!deepEqual(filter, prevLayer.filter)) {
    map.setFilter(id, filter);
  }
  if (
    minzoom &&
    maxzoom &&
    (minzoom !== prevLayer.minzoom || maxzoom !== prevLayer.maxzoom)
  ) {
    map.setLayerZoomRange(id, minzoom, maxzoom);
  }
}
