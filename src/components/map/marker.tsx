import {
  Alignment,
  LngLat,
  Map,
  Marker as MapboxMarker,
  PointLike,
} from 'mapbox-gl';
import React, { useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';

function arePointsEqual(a?: PointLike, b?: PointLike): boolean {
  const ax = Array.isArray(a) ? a[0] : a ? a.x : 0;
  const ay = Array.isArray(a) ? a[1] : a ? a.y : 0;
  const bx = Array.isArray(b) ? b[0] : b ? b.x : 0;
  const by = Array.isArray(b) ? b[1] : b ? b.y : 0;
  return ax === bx && ay === by;
}

type MarkerEvent<TEvent> = {
  type: string;
  target: MapboxMarker;
  originalEvent: TEvent;
};

type MapboxMarkerDragEvent = MarkerEvent<MouseEvent | TouchEvent>;
type MarkerDragEvent = MapboxMarkerDragEvent & {
  lngLat: LngLat;
};

export type MarkerProps = {
  longitude: number;
  latitude: number;
  draggable?: boolean;
  offset?: PointLike;
  pitchAlignment?: Alignment;
  rotation?: number;
  rotationAlignment?: Alignment;

  map: Map;
  children?: React.ReactNode;
  onClick?: (e: MarkerEvent<MouseEvent>) => void;
  onDragStart?: (e: MarkerDragEvent) => void;
  onDrag?: (e: MarkerDragEvent) => void;
  onDragEnd?: (e: MarkerDragEvent) => void;
};

export function Marker({
  longitude,
  latitude,
  offset,
  draggable = false,
  rotation = 0,
  rotationAlignment = 'auto',
  pitchAlignment = 'auto',
  map,
  children,
  onClick,
  onDragStart,
  onDrag,
  onDragEnd,
}: MarkerProps) {
  const callbackProps = { onClick, onDragStart, onDrag, onDragEnd };
  const callbackPropsRef = useRef(callbackProps);
  callbackPropsRef.current = callbackProps;

  const marker: MapboxMarker = useMemo(() => {
    let hasChildren = false;
    React.Children.forEach(children, (el) => {
      if (el) {
        hasChildren = true;
      }
    });
    const options = {
      longitude,
      latitude,
      draggable,
      offset,
      pitchAlignment,
      rotation,
      rotationAlignment,
      element: hasChildren ? document.createElement('div') : undefined,
    };

    const m = new MapboxMarker(options);
    m.setLngLat([longitude, latitude]);

    m.getElement().addEventListener('click', (e) => {
      callbackPropsRef.current.onClick?.({
        type: 'click',
        target: m,
        originalEvent: e,
      });
    });

    m.on('dragstart', (e) => {
      const evt = {
        ...(e as MapboxMarkerDragEvent),
        lngLat: marker.getLngLat(),
      };
      callbackPropsRef.current.onDragStart?.(evt);
    });
    m.on('drag', (e) => {
      const evt = {
        ...(e as MapboxMarkerDragEvent),
        lngLat: marker.getLngLat(),
      };
      callbackPropsRef.current.onDrag?.(evt);
    });
    m.on('dragend', (e) => {
      const evt = {
        ...(e as MapboxMarkerDragEvent),
        lngLat: marker.getLngLat(),
      };
      callbackPropsRef.current.onDragEnd?.(evt);
    });

    return m;
  }, []);

  useEffect(() => {
    marker.addTo(map);

    return () => {
      marker.remove();
    };
  }, []);

  if (
    marker.getLngLat().lng !== longitude ||
    marker.getLngLat().lat !== latitude
  ) {
    marker.setLngLat([longitude, latitude]);
  }
  if (offset && !arePointsEqual(marker.getOffset(), offset)) {
    marker.setOffset(offset);
  }
  if (marker.isDraggable() !== draggable) {
    marker.setDraggable(draggable);
  }
  if (marker.getRotation() !== rotation) {
    marker.setRotation(rotation);
  }
  if (marker.getRotationAlignment() !== rotationAlignment) {
    marker.setRotationAlignment(rotationAlignment);
  }
  if (marker.getPitchAlignment() !== pitchAlignment) {
    marker.setPitchAlignment(pitchAlignment);
  }

  return createPortal(children, marker.getElement());
}
