import { Route, shallow, useStore } from '@/store';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { useRef, useState } from 'react';
import IconButton from './icon-button';
import styles from './route-controls.module.css';
import useInteractOutside from './useInteractOutside';

export default function RouteControls({
  route,
  triggerRename,
}: {
  route: Route;
  triggerRename: () => void;
}) {
  const [deleteRoute] = useStore((s) => [s.deleteRoute], shallow);

  const [isOpen, setIsOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  useInteractOutside(rootRef, () => setIsOpen(false));

  return (
    <div ref={rootRef} className={styles.root}>
      <IconButton
        icon={DotsHorizontalIcon}
        onClick={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <div className={styles.menuItems}>
          <div
            className={styles.menuItem}
            onClick={() => {
              setIsOpen(false);
              triggerRename();
            }}
          >
            Rename
          </div>
          <div
            className={styles.menuItem}
            onClick={() => {
              setIsOpen(false);
              deleteRoute(route.id);
            }}
          >
            Delete
          </div>
        </div>
      )}
    </div>
  );
}
