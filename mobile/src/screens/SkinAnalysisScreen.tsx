import React, { useState } from 'react';
import { View, Button, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { SkinAnalysisNavigationProp } from '../types/navigation';
import { analyzeSkin } from '../services/skinAnalysisService';

const SkinAnalysisScreen: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigation = useNavigation<SkinAnalysisNavigationProp>();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.cancelled) setImageUri(result.uri);
  };

  const handleAnalyze = async () => {
    if (!imageUri) return;
    setLoading(true);
    try {
      const results = await analyzeSkin(imageUri);
      navigation.navigate('SkinAnalysisResult', { results });
    } catch (err) {
      Alert.alert('Error', 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }}>
      <Button title="Select Photo" onPress={pickImage} />
      {imageUri && (
        <Image source={{ uri: imageUri }} style={{ width: 200, height: 200, margin: 16 }} />
      )}
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        imageUri && <Button title="Analyze Skin" onPress={handleAnalyze} />
      )}
    </View>
  );
};

export default SkinAnalysisScreen;
