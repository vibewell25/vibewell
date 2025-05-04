import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, SafeAreaView, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { WellnessScreenNavigationProp } from '../../types/navigation';

// Sample data for wellness services
const mockServices = [
  {
    id: '1',
    name: 'Yoga Session',
    provider: 'Zen Studio',
    price: 45,
    duration: 60,
    rating: 4.9,
    category: 'yoga',
    description: 'Guided yoga session for all levels',
  },
  {
    id: '2',
    name: 'Meditation Class',
    provider: 'Mindful Space',
    price: 35,
    duration: 45,
    rating: 4.8,
    category: 'meditation',
    description: 'Guided meditation for stress relief',
  },
  {
    id: '3',
    name: 'Massage Therapy',
    provider: 'Healing Hands',
    price: 85,
    duration: 60,
    rating: 4.9,
    category: 'massage',
    description: 'Therapeutic massage for relaxation',
  },
  {
    id: '4',
    name: 'Nutrition Consultation',
    provider: 'Healthy Living',
    price: 75,
    duration: 45,
    rating: 4.7,
    category: 'nutrition',
    description: 'Personalized nutrition advice',
  },
  {
    id: '5',
    name: 'Fitness Training',
    provider: 'Fit Life',
    price: 65,
    duration: 60,
    rating: 4.8,
    category: 'fitness',
    description: 'Personal training session',
  },
];

interface ServiceItemProps {
  item: {
    id: string;
    name: string;
    provider: string;
    price: number;
    duration: number;
    rating: number;
    category: string;
    description: string;
  };
  isDarkMode: boolean;
}

const ServiceItem = ({ item, isDarkMode }: ServiceItemProps) => {
  return (
    <View style={[styles.serviceItem, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }]}>
      <Text style={[styles.serviceName, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
        {item.name}
      </Text>
      <Text style={[styles.serviceProvider, { color: isDarkMode ? '#BBBBBB' : '#666666' }]}>
        {item.provider}
      </Text>
      <Text style={[styles.serviceDescription, { color: isDarkMode ? '#BBBBBB' : '#666666' }]}>
        {item.description}
      </Text>
      <View style={styles.serviceDetails}>
        <Text style={[styles.servicePrice, { color: isDarkMode ? '#A5B4FC' : '#4F46E5' }]}>
          ${item.price}
        </Text>
        <Text style={[styles.serviceDuration, { color: isDarkMode ? '#BBBBBB' : '#666666' }]}>
          {item.duration} min
        </Text>
        <Text style={[styles.serviceRating, { color: isDarkMode ? '#BBBBBB' : '#666666' }]}>
          ★ {item.rating}
        </Text>
      </View>
    </View>
  );
};

const WellnessServicesScreen: React.FC = () => {
  const navigation = useNavigation<WellnessScreenNavigationProp>();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredServices, setFilteredServices] = useState(mockServices);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredServices(mockServices);
    } else {
      setFilteredServices(mockServices.filter(service => service.category === selectedCategory));
    }
  }, [selectedCategory]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#F5F5F5' }]}>
      {/* Tab switcher between Beauty and Wellness */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity onPress={() => navigation.navigate('Beauty')} style={styles.tabButton}>
          <Text style={[styles.tabText, { color: isDarkMode ? '#BBBBBB' : '#666666' }]}>Beauty</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Wellness')} style={[styles.tabButton, styles.activeTabButton]}>
          <Text style={[styles.tabText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Wellness</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.header, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
        Wellness Services
      </Text>
      
      <FlatList
        data={filteredServices}
        renderItem={({ item }) => <ServiceItem item={item} isDarkMode={isDarkMode} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.servicesList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabSwitcher: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#4F46E5',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 16,
  },
  servicesList: {
    padding: 16,
  },
  serviceItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceProvider: {
    fontSize: 14,
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  serviceDuration: {
    fontSize: 14,
  },
  serviceRating: {
    fontSize: 14,
  },
});

export default WellnessServicesScreen; 