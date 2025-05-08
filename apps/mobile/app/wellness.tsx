import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from 'react-native';

const wellnessCategories = [
  {
    id: '1',
    name: 'Meditation',
    description: 'Find your inner peace',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: '2',
    name: 'Yoga',
    description: 'Balance body and mind',
    image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: '3',
    name: 'Nutrition',
    description: 'Healthy eating guides',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: '4',
    name: 'Mental Health',
    description: 'Tools for mental wellness',
    image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  }
];

const wellnessPrograms = [
  {
    id: '1',
    name: '30-Day Mindfulness',
    duration: '30 days',
    image: 'https://images.unsplash.com/photo-1561049501-e1f9a1891e74?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: '2',
    name: 'Stress Reduction',
    duration: '14 days',
    image: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: '3',
    name: 'Better Sleep',
    duration: '21 days',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  }
];

export default function WellnessScreen() {
  const router = useRouter();

  const handleCategoryPress = (categoryId: string) => {
    router.push({
      pathname: `/wellness/category/[id]`,
      params: { id: categoryId }
    });
  };

  const handleProgramPress = (programId: string) => {
    router.push({
      pathname: `/wellness/program/[id]`,
      params: { id: programId }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wellness Journey</Text>
        <Text style={styles.headerSubtitle}>Discover balance and well-being</Text>
      </View>

      <Text style={styles.sectionTitle}>Wellness Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {wellnessCategories.map(category => (
          <TouchableOpacity 
            key={category.id} 
            style={styles.categoryCard}
            onPress={() => handleCategoryPress(category.id)}
          >
            <Image source={{ uri: category.image }} style={styles.categoryImage} />
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryDescription}>{category.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Featured Programs</Text>
      <View style={styles.programsContainer}>
        {wellnessPrograms.map(program => (
          <TouchableOpacity 
            key={program.id} 
            style={styles.programCard}
            onPress={() => handleProgramPress(program.id)}
          >
            <Image source={{ uri: program.image }} style={styles.programImage} />
            <View style={styles.programInfo}>
              <Text style={styles.programName}>{program.name}</Text>
              <Text style={styles.programDuration}>{program.duration}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.trackingButton}
        onPress={() => router.push('/wellness/tracking')}
      >
        <Text style={styles.trackingButtonText}>Track Your Wellness</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#e8f4f8',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2a6877',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#5c8a97',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 16,
    color: '#333',
  },
  categoriesContainer: {
    paddingLeft: 16,
    marginBottom: 24,
  },
  categoryCard: {
    width: 180,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryImage: {
    width: '100%',
    height: 120,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 12,
    paddingBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#666',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  programsContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  programCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  programImage: {
    width: 100,
    height: 100,
  },
  programInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  programName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  programDuration: {
    fontSize: 14,
    color: '#666',
  },
  trackingButton: {
    backgroundColor: '#6200ee',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  trackingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
}); 