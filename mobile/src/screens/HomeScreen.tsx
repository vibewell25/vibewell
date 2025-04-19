import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Feather } from '@expo/vector-icons';

const HomeScreen: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }
      ]}
    >
      <View style={styles.header}>
        <Text style={[
          styles.title,
          { color: isDarkMode ? '#FFFFFF' : '#000000' }
        ]}>
          Welcome to VibeWell
        </Text>
        <Text style={[
          styles.subtitle,
          { color: isDarkMode ? '#E0E0E0' : '#666666' }
        ]}>
          Your wellness & beauty journey starts here
        </Text>
      </View>
      
      <View style={styles.content}>
        <View style={[
          styles.card,
          { backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5' }
        ]}>
          <Text style={[
            styles.cardTitle,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            Today's Wellness Tip
          </Text>
          <Text style={[
            styles.cardText,
            { color: isDarkMode ? '#E0E0E0' : '#444444' }
          ]}>
            Take 5 minutes to practice mindful breathing. It can reduce stress and improve focus.
          </Text>
        </View>
        
        <View style={[
          styles.card,
          { backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5' }
        ]}>
          <View style={styles.cardHeader}>
            <Text style={[
              styles.cardTitle,
              { color: isDarkMode ? '#FFFFFF' : '#000000' }
            ]}>
              Featured Beauty Service
            </Text>
            <Feather name="star" size={16} color="#FFD700" />
          </View>
          <Text style={[
            styles.cardText,
            { color: isDarkMode ? '#E0E0E0' : '#444444' }
          ]}>
            Spring Glow Facial: Revitalize your skin with our signature treatment using organic ingredients.
          </Text>
          <TouchableOpacity style={styles.cardButton}>
            <Text style={styles.cardButtonText}>Book Now</Text>
          </TouchableOpacity>
        </View>
        
        <View style={[
          styles.card,
          { backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5' }
        ]}>
          <Text style={[
            styles.cardTitle,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            Upcoming Sessions
          </Text>
          <Text style={[
            styles.cardText,
            { color: isDarkMode ? '#E0E0E0' : '#444444' }
          ]}>
            You have no upcoming sessions. Book a new session to start your wellness journey.
          </Text>
        </View>
        
        <View style={[
          styles.card,
          { backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5' }
        ]}>
          <Text style={[
            styles.cardTitle,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            Community Events
          </Text>
          <Text style={[
            styles.cardText,
            { color: isDarkMode ? '#E0E0E0' : '#444444' }
          ]}>
            Join our weekend meditation group this Saturday at 10 AM.
          </Text>
        </View>
        
        <View style={styles.quickAccess}>
          <Text style={[
            styles.quickAccessTitle,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            Quick Access
          </Text>
          <View style={styles.quickAccessGrid}>
            <TouchableOpacity style={[
              styles.quickAccessButton,
              { backgroundColor: isDarkMode ? '#2D3748' : '#E6F7FF' }
            ]}>
              <Feather name="activity" size={24} color={isDarkMode ? '#FFFFFF' : '#4F46E5'} />
              <Text style={[
                styles.quickAccessText,
                { color: isDarkMode ? '#FFFFFF' : '#000000' }
              ]}>Wellness</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[
              styles.quickAccessButton,
              { backgroundColor: isDarkMode ? '#2D3748' : '#FCE7F3' }
            ]}>
              <Feather name="scissors" size={24} color={isDarkMode ? '#FFFFFF' : '#DB2777'} />
              <Text style={[
                styles.quickAccessText,
                { color: isDarkMode ? '#FFFFFF' : '#000000' }
              ]}>Beauty</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[
              styles.quickAccessButton,
              { backgroundColor: isDarkMode ? '#2D3748' : '#F0FDF4' }
            ]}>
              <Feather name="calendar" size={24} color={isDarkMode ? '#FFFFFF' : '#16A34A'} />
              <Text style={[
                styles.quickAccessText,
                { color: isDarkMode ? '#FFFFFF' : '#000000' }
              ]}>Book</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[
              styles.quickAccessButton,
              { backgroundColor: isDarkMode ? '#2D3748' : '#FEF3C7' }
            ]}>
              <Feather name="users" size={24} color={isDarkMode ? '#FFFFFF' : '#D97706'} />
              <Text style={[
                styles.quickAccessText,
                { color: isDarkMode ? '#FFFFFF' : '#000000' }
              ]}>Community</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  content: {
    padding: 15,
  },
  card: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  cardButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  cardButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  quickAccess: {
    marginTop: 10,
    marginBottom: 30,
  },
  quickAccessTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAccessButton: {
    width: '48%',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  quickAccessText: {
    marginTop: 8,
    fontWeight: '600',
  },
});

export default HomeScreen; 