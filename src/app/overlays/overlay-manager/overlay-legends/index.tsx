import { OverlayId } from '@/types';
import { ReactNode } from 'react';
import styles from './index.module.css';

const slopeAngles: {
  start: number;
  end: number;
  color: [number, number, number];
}[] = [
  { start: 27, end: 29, color: [248, 253, 85] },
  { start: 30, end: 31, color: [241, 184, 64] },
  { start: 32, end: 34, color: [238, 128, 49] },
  { start: 35, end: 45, color: [235, 51, 35] },
  { start: 46, end: 50, color: [122, 41, 217] },
  { start: 51, end: 59, color: [0, 38, 245] },
  { start: 60, end: 90, color: [0, 0, 0] },
];

const overlayLegends: Record<OverlayId, ReactNode> = {
  'slope-angle': (
    <div className={styles.slopeAngleLegend}>
      {slopeAngles.map(({ start, end, color }) => {
        const [r, g, b] = color;

        // determine the font color based on the luminance so we do not have to hard-code the right font color for each legend background color
        const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        // TODO: use CSS color variables once we introduce them
        const fontColor = luminance > 0.6 ? '#151515' : '#fff';

        return (
          <div
            key={start}
            className={styles.slopeAngleLegendItem}
            style={{
              background: `rgb(${r} ${g} ${b})`,
              color: fontColor,
            }}
          >
            {start}-{end}
          </div>
        );
      })}
    </div>
  ),
};

export default overlayLegends;
