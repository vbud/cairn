import { useStore } from '@/store';
import { objectEntries } from '@/utils/object';
import { overlayConfigs } from '../overlay-configs';
import styles from './index.module.css';
import overlayLegends from './overlay-legends';

export function OverlayManager() {
  const [overlays, toggleOverlay, changeOverlayOpacity] = useStore((s) => [
    s.overlays,
    s.toggleOverlay,
    s.changeOverlayOpacity,
  ]);

  return (
    <div>
      <h1 className={styles.heading}>Overlays</h1>
      {objectEntries(overlayConfigs).map(([id, { name }]) => {
        const { isActive, opacity } = overlays[id];
        const legend = overlayLegends[id];
        return (
          <div key={id} className={styles.overlay}>
            <label className={styles.overlayLabel}>
              <input
                className={styles.overlayCheckbox}
                type="checkbox"
                checked={isActive}
                onChange={() => toggleOverlay(id)}
              />
              {name}
            </label>
            {isActive && (
              <div className={styles.activeOverlay}>
                {legend}
                <input
                  type="range"
                  step={1}
                  value={opacity * 100}
                  onChange={(e) => {
                    changeOverlayOpacity(id, Number(e.target.value) / 100);
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
