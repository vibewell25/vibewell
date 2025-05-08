import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import BeautyCategories from '../src/components/beauty/BeautyCategories';
import BeautyServiceCard from '../src/components/beauty/BeautyServiceCard';

const beautyServices = [
  {
    id: '1',
    name: 'Facial Treatment',
    price: 85,
    duration: 60,
    rating: 4.8,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    provider: 'Glow Spa & Beauty'
  },
  {
    id: '2',
    name: 'Hair Styling',
    price: 65,
    duration: 45,
    rating: 4.6,
    reviews: 98,
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    provider: 'Chic Hair Studio'
  },
  {
    id: '3',
    name: 'Manicure & Pedicure',
    price: 55,
    duration: 50,
    rating: 4.7,
    reviews: 112,
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    provider: 'Nail Paradise'
  },
  {
    id: '4',
    name: 'Full Body Massage',
    price: 95,
    duration: 90,
    rating: 4.9,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    provider: 'Serenity Wellness'
  }
];

const categories = [
  { id: '1', name: 'Facial', icon: 'face-woman' },
  { id: '2', name: 'Hair', icon: 'hair-dryer' },
  { id: '3', name: 'Nails', icon: 'hand-wave' },
  { id: '4', name: 'Massage', icon: 'human-handsup' },
  { id: '5', name: 'Makeup', icon: 'brush' }
];

export default function BeautyScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const onChangeSearch = (query: string) => setSearchQuery(query);

  const handleServicePress = (serviceId: string) => {
    router.push(`/beauty/${serviceId}`);
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/beauty/category/${categoryId}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Searchbar
        placeholder="Search beauty services"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      <Text style={styles.sectionTitle}>Categories</Text>
      <BeautyCategories 
        categories={categories} 
        onCategoryPress={handleCategoryPress} 
      />
      
      <Text style={styles.sectionTitle}>Popular Services</Text>
      <View style={styles.servicesContainer}>
        {beautyServices.map(service => (
          <BeautyServiceCard
            key={service.id}
            service={service}
            onPress={() => handleServicePress(service.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    marginBottom: 20,
    elevation: 0,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  servicesContainer: {
    gap: 16,
  }
}); 