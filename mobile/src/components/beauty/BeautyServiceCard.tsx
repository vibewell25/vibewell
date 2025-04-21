import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BeautyService } from '../../types/beauty';

interface BeautyServiceCardProps {
  service: BeautyService;
  onPress: (service: BeautyService) => void;
  isDarkMode: boolean;
}

const BeautyServiceCard: React.FC<BeautyServiceCardProps> = ({ 
  service, 
  onPress, 
  isDarkMode 
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }
      ]}
      onPress={() => onPress(service)}
      testID="beautyServiceCard"
    >
      <Image 
        source={{ uri: service.imageUrl }} 
        style={styles.image}
        resizeMode="cover"
        testID="serviceImage"
      />
      <View style={styles.content}>
        <Text 
          style={[
            styles.title,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}
          numberOfLines={1}
          testID="serviceTitle"
        >
          {service.title}
        </Text>
        <Text 
          style={[
            styles.description,
            { color: isDarkMode ? '#E0E0E0' : '#444444' }
          ]}
          numberOfLines={2}
          testID="serviceDescription"
        >
          {service.description}
        </Text>
        <View style={styles.footer}>
          <Text 
            style={[
              styles.price,
              { color: isDarkMode ? '#FFFFFF' : '#000000' }
            ]}
            testID="servicePrice"
          >
            ${service.price}
          </Text>
          <Text 
            style={[
              styles.duration,
              { color: isDarkMode ? '#E0E0E0' : '#444444' }
            ]}
            testID="serviceDuration"
          >
            {service.duration} min
          </Text>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={14} color="#FFD700" />
            <Text 
              style={[
                styles.rating,
                { color: isDarkMode ? '#E0E0E0' : '#444444' }
              ]}
              testID="serviceRating"
            >
              {service.rating}
            </Text>
          </View>
        </View>
      </View>
      {service.featured && (
        <View style={styles.featuredBadge} testID="featuredBadge">
          <Text style={styles.featuredText}>Featured</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
    height: 210,
  },
  image: {
    width: '100%',
    height: 120,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  duration: {
    fontSize: 14,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
  },
  featuredBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  featuredText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default BeautyServiceCard; 