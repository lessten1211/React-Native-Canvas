import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import {
  Canvas,
  Path,
  Skia,
  useComputedValue,
  useTiming,
} from '@shopify/react-native-skia';

const { width } = Dimensions.get('window');

export const SkiaDemo = () => {
  // 无限平滑循环
  const progress = useTiming({
    duration: 5000,
    loop: true,
  });

  const animatedPath = useComputedValue(() => {
    const path = Skia.Path.Make();

    const startX = 30;
    const startY = 200;
    const endX = width - 30;

    const t = progress.current;

    // 动态波动控制点（制造方向感）
    const waveHeight = 60 + Math.sin(t * Math.PI * 2) * 300;
    const waveOffsetX = Math.cos(t * Math.PI * 2) * 60;

    const controlX = (startX + endX) / 2 + waveOffsetX;
    const controlY = startY - waveHeight;

    const currentX = startX + (endX - startX) * t;

    path.moveTo(startX, startY);
    path.quadTo(
      controlX,
      controlY,
      currentX,
      startY
    );

    return path;
  }, [progress]);

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <Path
          path={animatedPath}
          color="white"
          style="stroke"
          strokeWidth={4}
          strokeCap="round"
        />
      </Canvas>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  canvas: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
