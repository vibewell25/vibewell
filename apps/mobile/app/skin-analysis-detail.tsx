import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { getSkinAnalysisResult } from '../src/services/skinAnalysisService';
import { SkinAnalysisResult } from '../src/services/skinAnalysisService';

export default function SkinAnalysisDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<SkinAnalysisResult | null>(null);

  useEffect(() => {
    if (id) {
      loadAnalysisResult(id);
    }
  }, [id]);

  const loadAnalysisResult = async (analysisId: string) => {
    setLoading(true);
    try {
      const data = await getSkinAnalysisResult(analysisId);
      setResult(data);
    } catch (error) {
      console.error('Error loading skin analysis result:', error);
      alert('Failed to load analysis details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading analysis details...</Text>
      </View>
    );
  }

  if (!result) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Could not find analysis details for the selected date.
        </Text>
      </View>
    );
  }

  // Format date
  const date = result.date ? new Date(result.date) : new Date();
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Analysis Details',
          headerStyle: {
            backgroundColor: '#f4f4f8',
          },
          headerTintColor: '#6200ee',
        }}
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Skin Analysis Result</Text>
        <Text style={styles.dateText}>{formattedDate} at {formattedTime}</Text>
      </View>

      {result.imageUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: result.imageUri }} style={styles.image} />
        </View>
      )}

      <View style={styles.scoreSection}>
        <Text style={styles.sectionTitle}>Overall Skin Health</Text>
        <View style={styles.overallScoreContainer}>
          <Text style={styles.overallScore}>{result.overallScore}</Text>
          <Text style={styles.outOf}>/100</Text>
        </View>
        
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
        
        <Text style={styles.scoreDescription}>
          {result.overallScore > 70 ? 'Your skin is in excellent health!' : 
           result.overallScore > 40 ? 'Your skin is in fair condition.' :
           'Your skin needs some special attention.'}
        </Text>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Skin Conditions</Text>
        {result.conditions.map((condition, index) => (
          <View key={index} style={styles.conditionCard}>
            <View style={styles.conditionHeader}>
              <Text style={styles.conditionName}>{condition.name}</Text>
              <View style={styles.severityContainer}>
                <Text style={styles.severityLabel}>Severity</Text>
                <View style={styles.severityBar}>
                  <View 
                    style={[
                      styles.severityBarFill,
                      { width: `${(condition.severity / 10) * 100}%` },
                      condition.severity <= 3 ? styles.severityLow :
                      condition.severity <= 7 ? styles.severityMedium : styles.severityHigh
                    ]}
                  />
                </View>
                <Text style={styles.severityValue}>{condition.severity}/10</Text>
              </View>
            </View>
            <Text style={styles.conditionDescription}>{condition.description}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Recommendations</Text>
        {result.recommendations.map((recommendation, index) => (
          <View key={index} style={styles.recommendationCard}>
            <Text style={styles.recommendationTitle}>
              {index + 1}. {recommendation.title}
            </Text>
            <Text style={styles.recommendationDescription}>
              {recommendation.description}
            </Text>
          </View>
        ))}
      </View>

      {result.products && result.products.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Recommended Products</Text>
          {result.products.map((product, index) => (
            <View key={index} style={styles.productCard}>
              {product.imageUri && (
                <Image source={{ uri: product.imageUri }} style={styles.productImage} />
              )}
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productBrand}>{product.brand}</Text>
                <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                <Text style={styles.productDescription}>{product.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f4f4f8',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  scoreSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  overallScoreContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  overallScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  outOf: {
    fontSize: 20,
    color: '#666',
    marginBottom: 8,
    marginLeft: 4,
  },
  scoreBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
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
  scoreDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  conditionCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  conditionHeader: {
    marginBottom: 12,
  },
  conditionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  severityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityLabel: {
    fontSize: 14,
    color: '#666',
    width: 60,
  },
  severityBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  severityBarFill: {
    height: '100%',
  },
  severityLow: {
    backgroundColor: '#4CAF50',
  },
  severityMedium: {
    backgroundColor: '#FFC107',
  },
  severityHigh: {
    backgroundColor: '#F44336',
  },
  severityValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    width: 40,
    textAlign: 'right',
  },
  conditionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  recommendationCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  productCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
}); 