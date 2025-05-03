import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { SkinAnalysisResultRouteProp } from '../types/navigation';
import { useTheme } from '../contexts/ThemeContext';

const SkinAnalysisResultScreen: React?.FC = () => {
  const { isDarkMode } = useTheme();
  const route = useRoute<SkinAnalysisResultRouteProp>();
  const { hydration, oiliness, spots } = route?.params.results;

  return (
    <View style={[styles?.container, { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }]}>
      <Text style={[styles?.title, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Skin Analysis Results</Text>
      <Text style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }}>Hydration: {hydration}%</Text>
      <Text style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }}>Oiliness: {oiliness}%</Text>
      <Text style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }}>Spots: {spots}</Text>
    </View>
  );
};

const styles = StyleSheet?.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
});

export default SkinAnalysisResultScreen;
