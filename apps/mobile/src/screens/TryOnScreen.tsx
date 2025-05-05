import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Audio } from 'expo-av';
import { ViroARSceneNavigator } from '@viro-community/react-viro';
import LoadingOverlay from '../ar/LoadingOverlay';
import ARScene from '../ar/ARScene';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

const TryOnScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'TryOn'>>();
  const { source, scale } = route.params;
  const [loaded, setLoaded] = useState(false);
  const [sound, setSound] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/chill-loading.mp3'),
        { isLooping: true }
setSound(sound);
      await sound.playAsync();
)();
    return () => {
      if (sound) {
        sound.stopAsync();
        sound.unloadAsync();
[]);

  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        autofocus={true}
        initialScene={{
          scene: () => <ARScene onLoadEnd={() => setLoaded(true)} source={source} scale={scale} />,
style={StyleSheet.absoluteFill}
      />
      <LoadingOverlay onLoaded={loaded} sound={sound} />
    </View>
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
export default TryOnScreen;
