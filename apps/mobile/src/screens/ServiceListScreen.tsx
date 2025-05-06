import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { fetchServices } from '../services/serviceService';
import { Service } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types/navigation';

type ServiceListNavigationProp = StackNavigationProp<RootStackParamList, 'ServiceList'>;

const ServiceListScreen: React.FC = () => {
  const navigation = useNavigation<ServiceListNavigationProp>();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices()
      .then(setServices)
      .catch(console.error)
      .finally(() => setLoading(false));
[]);

  if (loading) return <ActivityIndicator size="large" color="#2A9D8F" />;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('ServiceDetail', { service: item })}>
            <View style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
              <Text style={{ fontSize: 18 }}>{item.name}</Text>
              <Text style={{ color: 'gray' }}>${item.price.toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={{ position: 'absolute', right: 16, bottom: 16, backgroundColor: '#2A9D8F', borderRadius: 24, padding: 16 }}
        onPress={() => navigation.navigate('ServiceForm', {})}
      >
        <Text style={{ color: '#fff', fontSize: 24 }}>+</Text>
      </TouchableOpacity>
    </View>
export default ServiceListScreen;
