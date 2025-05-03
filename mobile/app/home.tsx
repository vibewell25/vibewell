import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, SafeAreaView, ScrollView } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to VibeWell</Text>
          <Text style={styles.subtitle}>Your beauty and wellness companion</Text>
        </View>
        
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <View style={styles.featureIconContainer}>
              <Image 
                source={require('../assets/skin-icon.png')} 
                style={styles.featureIcon}
                defaultSource={require('../assets/placeholder-icon.png')}
              />
            </View>
            <Text style={styles.featureTitle}>Skin Analysis</Text>
            <Text style={styles.featureDescription}>
              Get AI-powered analysis of your skin and personalized recommendations
            </Text>
            <Link href="skin-analysis" asChild>
              <TouchableOpacity style={styles.featureButton}>
                <Text style={styles.featureButtonText}>Analyze Now</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <View style={styles.feature}>
            <View style={styles.featureIconContainer}>
              <Image 
                source={require('../assets/history-icon.png')} 
                style={styles.featureIcon}
                defaultSource={require('../assets/placeholder-icon.png')}
              />
            </View>
            <Text style={styles.featureTitle}>Analysis History</Text>
            <Text style={styles.featureDescription}>
              Track your skin health progress over time with detailed insights
            </Text>
            <Link href="skin-analysis-history" asChild>
              <TouchableOpacity style={styles.featureButton}>
                <Text style={styles.featureButtonText}>View History</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <View style={styles.feature}>
            <View style={styles.featureIconContainer}>
              <Image 
                source={require('../assets/community-icon.png')} 
                style={styles.featureIcon}
                defaultSource={require('../assets/placeholder-icon.png')}
              />
            </View>
            <Text style={styles.featureTitle}>Beauty Community</Text>
            <Text style={styles.featureDescription}>
              Connect with others, share tips, and discover new beauty trends
            </Text>
            <TouchableOpacity style={[styles.featureButton, styles.comingSoonButton]}>
              <Text style={styles.comingSoonButtonText}>Coming Soon</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.feature}>
            <View style={styles.featureIconContainer}>
              <Image 
                source={require('../assets/appointment-icon.png')} 
                style={styles.featureIcon}
                defaultSource={require('../assets/placeholder-icon.png')}
              />
            </View>
            <Text style={styles.featureTitle}>Appointments</Text>
            <Text style={styles.featureDescription}>
              Book beauty and wellness appointments with top professionals
            </Text>
            <TouchableOpacity style={[styles.featureButton, styles.comingSoonButton]}>
              <Text style={styles.comingSoonButtonText}>Coming Soon</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  feature: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f4f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 30,
    height: 30,
    tintColor: '#6200ee',
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 22,
  },
  featureButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  featureButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  comingSoonButton: {
    backgroundColor: '#e0e0e0',
  },
  comingSoonButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 