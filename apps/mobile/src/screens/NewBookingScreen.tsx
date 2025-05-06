import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, ScrollView, Switch } from 'react-native';
import { beautyApi } from '../services/api';
import { BeautyService, BeautyCategory, BeautyFilter } from '@/types/beauty';
import { useNavigation } from '@react-navigation/native';
import { BeautyBookingNavigationProp } from '@/types/navigation';

const NewBookingScreen: React.FC = () => {
  const navigation = useNavigation<BeautyBookingNavigationProp>();
  const [services, setServices] = useState<BeautyService[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<BeautyCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minDuration, setMinDuration] = useState<string>('');
  const [maxDuration, setMaxDuration] = useState<string>('');
  const [minRating, setMinRating] = useState<string>('');
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(false);

  useEffect(() => {
    beautyApi.getCategories()
      .then(setCategories)
      .catch(console.error);
[]);

  useEffect(() => {
    setLoading(true);
    const filters: BeautyFilter = {};
    if (selectedCategory) filters.categoryId = selectedCategory;
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (minDuration) filters.minDuration = parseFloat(minDuration);
    if (maxDuration) filters.maxDuration = parseFloat(maxDuration);
    if (minRating) filters.minRating = parseFloat(minRating);
    if (featuredOnly) filters.featured = true;
    beautyApi.getServices(searchTerm, filters)
      .then(setServices)
      .catch(console.error)
      .finally(() => setLoading(false));
[searchTerm, selectedCategory, minPrice, maxPrice, minDuration, maxDuration, minRating, featuredOnly]);

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />;
return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search services..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        style={styles.searchInput}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <TouchableOpacity
          onPress={() => setSelectedCategory(undefined)}
          style={[styles.filterButton, !selectedCategory && styles.filterButtonSelected]}
        >
          <Text style={[styles.filterButtonText, !selectedCategory && styles.filterButtonTextSelected]}>All</Text>
        </TouchableOpacity>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setSelectedCategory(cat.id)}
            style={[styles.filterButton, selectedCategory === cat.id && styles.filterButtonSelected]}
          >
            <Text style={[styles.filterButtonText, selectedCategory === cat.id && styles.filterButtonTextSelected]}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.filterRow}>
        <TextInput
          placeholder="Min Price"
          value={minPrice}
          onChangeText={setMinPrice}
          keyboardType="numeric"
          style={styles.filterInput}
        />
        <TextInput
          placeholder="Max Price"
          value={maxPrice}
          onChangeText={setMaxPrice}
          keyboardType="numeric"
          style={styles.filterInput}
        />
      </View>
      <View style={styles.filterRow}>
        <TextInput
          placeholder="Min Duration"
          value={minDuration}
          onChangeText={setMinDuration}
          keyboardType="numeric"
          style={styles.filterInput}
        />
        <TextInput
          placeholder="Max Duration"
          value={maxDuration}
          onChangeText={setMaxDuration}
          keyboardType="numeric"
          style={styles.filterInput}
        />
      </View>
      <View style={styles.switchContainer}>
        <TextInput
          placeholder="Min Rating"
          value={minRating}
          onChangeText={setMinRating}
          keyboardType="numeric"
          style={styles.filterInputSmall}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16 }}>
          <Switch value={featuredOnly} onValueChange={setFeaturedOnly} />
          <Text style={{ marginLeft: 8 }}>Featured Only</Text>
        </View>
      </View>
      <FlatList
        data={services}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={async () => {
              const details = await beautyApi.getServiceDetails(item.id);
              navigation.navigate('BeautyBooking', { service: details });
>
            <Text style={styles.title}>{item.title}</Text>
            <Text>Price: {item.price}</Text>
            <Text>Duration: {item.duration} mins</Text>
          </TouchableOpacity>
        )}
      />
    </View>
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  searchInput: { height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, marginBottom: 8 },
  filterContainer: { marginBottom: 8 },
  filterButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#2A9D8F', marginRight: 8 },
  filterButtonSelected: { backgroundColor: '#2A9D8F' },
  filterButtonText: { color: '#2A9D8F', fontSize: 14 },
  filterButtonTextSelected: { color: '#fff' },
  item: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  filterRow: { flexDirection: 'row', marginBottom: 8 },
  filterInput: { flex: 1, height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, marginRight: 8 },
  filterInputSmall: { width: 100, height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 8 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
export default NewBookingScreen;
