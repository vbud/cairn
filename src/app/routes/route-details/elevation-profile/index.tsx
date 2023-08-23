import { Route } from '@/store';
import colors from '@/utils/colors';
import { lineString } from '@turf/helpers';
import length from '@turf/length';
import { Map } from 'mapbox-gl';
import { memo } from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import styles from './index.module.css';

type ChartData = { distance: number; elevation: number }[];

function generateChartData(
  routeCoordinates: Route['pathGeometry']['coordinates'],
  map: Map
) {
  const chartData: ChartData = [];
  routeCoordinates.forEach((lngLat, i) => {
    const elevation = (map.queryTerrainElevation(lngLat) || 0) * 3.28084;

    if (i === 0) {
      chartData.push({
        distance: 0,
        elevation,
      });
    } else {
      chartData.push({
        distance:
          chartData[i - 1].distance +
          length(lineString([routeCoordinates[i - 1], lngLat]), {
            units: 'miles',
          }),
        elevation,
      });
    }
  });
  return chartData;
}

const ElevationProfile = memo(
  ({
    routeCoordinates,
    map,
  }: {
    routeCoordinates: Route['pathGeometry']['coordinates'];
    map: Map;
  }) => {
    const chartData = generateChartData(routeCoordinates, map);

    return (
      <ResponsiveContainer className={styles.root} width="100%" height={200}>
        <LineChart width={300} height={250} data={chartData}>
          <XAxis type="number" dataKey="distance" allowDecimals={false} />
          <YAxis
            type="number"
            domain={['dataMin', 'dataMax']}
            width={48}
            tickFormatter={(e) => e.toFixed(0)}
          />
          <Line
            type="monotone"
            dataKey="elevation"
            stroke={colors.plum9}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }
);
ElevationProfile.displayName = 'ElevationProfile';

export default ElevationProfile;
