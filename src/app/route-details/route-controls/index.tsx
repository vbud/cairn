import IconButton from '@/components/icon-button';
import { Route, useStore } from '@/store';
import useInteractOutside from '@/utils/useInteractOutside';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { useRef, useState } from 'react';
import styles from './index.module.css';

export default function RouteControls({
  route,
  triggerRename,
}: {
  route: Route;
  triggerRename: () => void;
}) {
  const [deleteRoute] = useStore((s) => [s.deleteRoute]);

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
