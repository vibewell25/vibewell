import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Image, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { analyzeSkin } from '../src/services/skinAnalysisService';
import { SkinAnalysisResult } from '../src/services/skinAnalysisService';

export default function SkinAnalysisScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SkinAnalysisResult | null>(null);

  const pickImage = async () => {
    try {
      // No permissions request is necessary for launching the image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        setResult(null); // Reset any previous results
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Failed to pick image. Please try again.');
    }
  };

  const handleAnalyze = async () => {
    if (!imageUri) {
      alert('Please select an image first');
      return;
    }

    setLoading(true);
    try {
      const analysisResult = await analyzeSkin(imageUri);
      setResult(analysisResult);
    } catch (error) {
      console.error('Error analyzing skin:', error);
      alert('Failed to analyze skin. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Skin Analysis',
          headerStyle: {
            backgroundColor: '#f4f4f8',
          },
          headerTintColor: '#6200ee',
        }}
      />
      
      <View style={styles.content}>
        <Text style={styles.title}>Skin Analysis</Text>
        <Text style={styles.subtitle}>
          Take a selfie or upload a photo to analyze your skin condition
        </Text>

        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>Select Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, !imageUri && styles.buttonDisabled]}
            onPress={handleAnalyze}
            disabled={!imageUri || loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Analyzing...' : 'Analyze Skin'}
            </Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6200ee" />
            <Text style={styles.loadingText}>Analyzing your skin...</Text>
          </View>
        )}

        {result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Analysis Results</Text>
            
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Overall Skin Health</Text>
              <Text style={styles.scoreValue}>{result.overallScore}/100</Text>
              <View style={styles.scoreBar}>
                <View 
                  style={[
                    styles.scoreBarFill, 
                    { width: `${result.overallScore}%` },
                    result.overallScore > 70 ? styles.scoreGood : 
                    result.overallScore > 40 ? styles.scoreMedium : styles.scorePoor
                  ]} 
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Identified Conditions</Text>
            {result.conditions.map((condition, index) => (
              <View key={index} style={styles.conditionItem}>
                <Text style={styles.conditionName}>{condition.name}</Text>
                <Text style={styles.conditionSeverity}>
                  Severity: {condition.severity}/10
                </Text>
                <Text style={styles.conditionDescription}>
                  {condition.description}
                </Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Recommendations</Text>
            <View style={styles.recommendationsContainer}>
              {result.recommendations.map((recommendation, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.recommendationTitle}>
                    {index + 1}. {recommendation.title}
                  </Text>
                  <Text style={styles.recommendationDescription}>
                    {recommendation.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'cover',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#a6a6a6',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  scoreContainer: {
    marginBottom: 25,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  scoreBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
  },
  scoreGood: {
    backgroundColor: '#4CAF50',
  },
  scoreMedium: {
    backgroundColor: '#FFC107',
  },
  scorePoor: {
    backgroundColor: '#F44336',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 20,
  },
  conditionItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
  },
  conditionName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  conditionSeverity: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
  },
  conditionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  recommendationsContainer: {
    marginTop: 5,
  },
  recommendationItem: {
    marginBottom: 15,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
}); 