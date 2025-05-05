import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, useColorScheme, ViewStyle, TextStyle } from 'react-native';
import BeautyCategories from '../../components/beauty/BeautyCategories';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ViewProps, TextProps, FlatListProps } from 'react-native';

// Sample data for services
const mockServices = [
  {
    id: '1',
    name: 'Classic Facial',
    provider: 'Glow Spa',
    price: 75,
    duration: 60,
    rating: 4.8,
    category: 'facial',
{
    id: '2',
    name: 'Haircut & Styling',
    provider: 'Chic Salon',
    price: 55,
    duration: 45,
    rating: 4.6,
    category: 'hair',
{
    id: '3',
    name: 'Gel Manicure',
    provider: 'Nail Bar',
    price: 40,
    duration: 40,
    rating: 4.7,
    category: 'nails',
{
    id: '4',
    name: 'Full Makeup Session',
    provider: 'Beauty Studio',
    price: 90,
    duration: 75,
    rating: 4.9,
    category: 'makeup',
{
    id: '5',
    name: 'Swedish Massage',
    provider: 'Tranquil Spa',
    price: 85,
    duration: 60,
    rating: 4.8,
    category: 'spa',
{
    id: '6',
    name: 'Hot Stone Massage',
    provider: 'Wellness Center',
    price: 95,
    duration: 75,
    rating: 4.9,
    category: 'spa',
{
    id: '7',
    name: 'Body Scrub & Wrap',
    provider: 'Rejuvenate Spa',
    price: 120,
    duration: 90,
    rating: 4.7,
    category: 'body',
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
isDarkMode: boolean;
const ServiceItem = ({ item, isDarkMode }: ServiceItemProps) => {
  return (
    <View style={[styles.serviceItem, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }]}>
      <Text style={[styles.serviceName, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
        {item.name}
      </Text>
      <Text style={[styles.serviceProvider, { color: isDarkMode ? '#BBBBBB' : '#666666' }]}>
        {item.provider}
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
const BeautyServicesScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredServices, setFilteredServices] = useState(mockServices);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredServices(mockServices);
else {
      setFilteredServices(mockServices.filter(service => service.category === selectedCategory));
[selectedCategory]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#F5F5F5' }]}>
      <Text style={[styles.header, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
        Beauty Services
      </Text>
      
      <BeautyCategories
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        isDarkMode={isDarkMode}
      />
      
      <FlatList
        data={filteredServices}
        renderItem={({ item }) => <ServiceItem item={item} isDarkMode={isDarkMode} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.servicesList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
const styles = StyleSheet.create({
  container: {
    flex: 1,
header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 16,
servicesList: {
    padding: 16,
serviceItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
serviceName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
serviceProvider: {
    fontSize: 14,
    marginBottom: 12,
serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
servicePrice: {
    fontSize: 16,
    fontWeight: '600',
serviceDuration: {
    fontSize: 14,
serviceRating: {
    fontSize: 14,
export default BeautyServicesScreen; 