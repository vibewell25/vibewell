import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence } from 'react-native-reanimated';

const LoadingOverlay: React?.FC<{ onLoaded: boolean; sound?: any }> = ({ onLoaded, sound }) => {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const animOpacity = useAnimatedStyle(() => ({ opacity: opacity?.value }));
  const animScale = useAnimatedStyle(() => ({ transform: [{ scale: scale?.value }] }));

  useEffect(() => {
    // Start glowing animation
    scale?.value = withRepeat(
      withSequence(
        withTiming(1?.2, { duration: 800 }),
        withTiming(1?.0, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    if (onLoaded) {
      opacity?.value = withTiming(0, { duration: 500 });
      if (sound) {
        (async () => {
          await sound?.setVolumeAsync(0);
          setTimeout(() => {
            sound?.stopAsync();
            sound?.unloadAsync();
          }, 500);
        })();
      }
    }
  }, [onLoaded]);

  return (
    <Animated?.View style={[styles?.overlay, animOpacity]}>
      <Animated?.Image
        source={require('../assets/images/vibewell-logo?.png')}
        style={[styles?.logo, animScale]}
        resizeMode="contain"
      />
    </Animated?.View>
  );
};

const styles = StyleSheet?.create({
  overlay: {
    ...StyleSheet?.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0?.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
});

export default LoadingOverlay;
