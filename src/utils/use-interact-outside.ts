import React, { useEffect } from 'react';

export function useInteractOutside(
  ref: React.RefObject<HTMLElement>,
  handler:
    | (() => void)
    | { onClickOutside: () => void; onEscapeKey: () => void }
) {
  useEffect(() => {
    if (!ref || !ref.current) return;

    const clickListener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      typeof handler === 'function' ? handler() : handler.onClickOutside();
    };

    const keyDownListener = (event: KeyboardEvent) => {
      if (!ref.current) return;

      if (event.code === 'Escape') {
        event.preventDefault();

        typeof handler === 'function' ? handler() : handler.onEscapeKey();
      }
    };

    document.addEventListener('click', clickListener);
    document.addEventListener('keydown', keyDownListener);

    return () => {
      document.removeEventListener('click', clickListener);
      document.removeEventListener('keydown', keyDownListener);
    };
  }, [ref, handler]);
}
