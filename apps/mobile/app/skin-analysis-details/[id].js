import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getSkinAnalysisResult } from '../../src/services/skinAnalysisService';
import { useColorScheme } from 'react-native';

export default function SkinAnalysisDetailsPage() {
  const { id } = useLocalSearchParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const data = await getSkinAnalysisResult(id);
        setAnalysis(data);
      } catch (error) {
        console.error('Error fetching analysis details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAnalysis();
    }
  }, [id]);

  const renderScoreBar = (value, label) => (
    <View style={styles.scoreBarContainer}>
      <View style={styles.scoreBarHeader}>
        <Text style={[styles.scoreBarLabel, isDark && styles.darkText]}>{label}</Text>
        <Text style={[styles.scoreBarValue, isDark && styles.darkText]}>{value}/100</Text>
      </View>
      <View style={styles.scoreBarBg}>
        <View 
          style={[
            styles.scoreBarFill, 
            { width: `${value}%` },
            value < 30 ? styles.scoreBarLow : value < 60 ? styles.scoreBarMedium : styles.scoreBarHigh
          ]} 
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loading, isDark && styles.darkContainer]}>
        <ActivityIndicator size="large" color="#2A9D8F" />
      </View>
    );
  }

  if (!analysis) {
    return (
      <View style={[styles.container, styles.center, isDark && styles.darkContainer]}>
        <Text style={[styles.errorText, isDark && styles.darkText]}>Analysis not found</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, isDark && styles.darkContainer]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, isDark && styles.darkText]}>Skin Analysis Results</Text>
      <Text style={[styles.date, isDark && styles.darkSubText]}>{analysis.date}</Text>
      
      {analysis.imageUri && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: analysis.imageUri }} 
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      )}
      
      <View style={[styles.scoreCard, isDark && styles.darkCard]}>
        <Text style={[styles.scoreCardTitle, isDark && styles.darkText]}>Overall Skin Health</Text>
        <Text style={[styles.overallScore, isDark && styles.darkText]}>{analysis.overall}/100</Text>
        
        <View style={styles.scoresContainer}>
          {renderScoreBar(analysis.hydration, 'Hydration')}
          {renderScoreBar(analysis.oiliness, 'Oiliness')}
          {renderScoreBar(analysis.spots, 'Spots')}
          {renderScoreBar(analysis.wrinkles, 'Wrinkles')}
          {renderScoreBar(analysis.firmness, 'Firmness')}
        </View>
      </View>
      
      {analysis.conditions.length > 0 && (
        <View style={[styles.section, isDark && styles.darkCard]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Conditions</Text>
          {analysis.conditions.map((condition, index) => (
            <View key={index} style={styles.conditionItem}>
              <View style={styles.conditionHeader}>
                <Text style={[styles.conditionName, isDark && styles.darkText]}>{condition.name}</Text>
                <Text style={[styles.conditionSeverity, isDark && styles.darkText]}>
                  Severity: {condition.severity}/10
                </Text>
              </View>
              <Text style={[styles.conditionDescription, isDark && styles.darkSubText]}>
                {condition.description}
              </Text>
            </View>
          ))}
        </View>
      )}
      
      {analysis.recommendations.length > 0 && (
        <View style={[styles.section, isDark && styles.darkCard]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Recommendations</Text>
          {analysis.recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendationItem}>
              <View style={styles.recommendationHeader}>
                <Text style={[styles.recommendationType, isDark && styles.darkAccentText]}>
                  {recommendation.type}
                </Text>
                <Text style={[styles.recommendationProduct, isDark && styles.darkText]}>
                  {recommendation.product}
                </Text>
              </View>
              <Text style={[styles.recommendationDescription, isDark && styles.darkSubText]}>
                {recommendation.description}
              </Text>
            </View>
          ))}
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/skin-analysis')}
      >
        <Text style={styles.buttonText}>Take New Analysis</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2A9D8F',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  darkText: {
    color: '#E0E0E0',
  },
  darkSubText: {
    color: '#AAAAAA',
  },
  darkAccentText: {
    color: '#4ECDC4',
  },
  imageContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 200,
  },
  scoreCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  darkCard: {
    backgroundColor: '#2A2A2A',
  },
  scoreCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  overallScore: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2A9D8F',
    marginBottom: 20,
    textAlign: 'center',
  },
  scoresContainer: {
    gap: 16,
  },
  scoreBarContainer: {
    width: '100%',
  },
  scoreBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  scoreBarLabel: {
    fontSize: 14,
    color: '#555',
  },
  scoreBarValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  scoreBarBg: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreBarLow: {
    backgroundColor: '#E76F51',
  },
  scoreBarMedium: {
    backgroundColor: '#F4A261',
  },
  scoreBarHigh: {
    backgroundColor: '#2A9D8F',
  },
  section: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  conditionItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  conditionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conditionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  conditionSeverity: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  conditionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  recommendationItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  recommendationHeader: {
    marginBottom: 8,
  },
  recommendationType: {
    fontSize: 14,
    color: '#2A9D8F',
    marginBottom: 4,
  },
  recommendationProduct: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#2A9D8F',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
}); 