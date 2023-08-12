import { Route } from '@/store';
import { lineString } from '@turf/helpers';
import length from '@turf/length';
import { memo } from 'react';
import { MapRef } from 'react-map-gl';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import colors from './colors';
import styles from './elevation-profile.module.css';

type ChartData = { distance: number; elevation: number }[];

function generateChartData(
  routeCoordinates: Route['pathGeometry']['coordinates'],
  map: MapRef
) {
  const chartData: ChartData = [];
  routeCoordinates.forEach((lngLat, i) => {
    // Use queryTerrainElevation on the map ref, not on the mapbox map instance. See https://github.com/visgl/react-map-gl/blob/ec63f691ec5a83bd652b64bb51aa02bcdc0703a8/src/mapbox/create-ref.ts#L65. It looks like react-map-gl messes with the map instance, so the ref's version of this function has to work around that.
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
    map: MapRef;
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
