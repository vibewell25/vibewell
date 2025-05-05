import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ServiceDetailRouteProp, ServiceDetailNavigationProp } from '../types/navigation';
import { deleteService } from '../services/serviceService';

const ServiceDetailScreen: React.FC = () => {
  const route = useRoute<ServiceDetailRouteProp>();
  const navigation = useNavigation<ServiceDetailNavigationProp>();
  const { service } = route.params;

  const handleDelete = async () => {
    try {
      await deleteService(service.id);
      navigation.navigate('ServiceList');
catch (e) {
      Alert.alert('Error', 'Failed to delete service');
return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{service.name}</Text>
      <Text style={{ marginVertical: 8 }}>Price: ${service.price.toFixed(2)}</Text>
      <Text style={{ marginBottom: 16 }}>Duration: {service.duration} minutes</Text>
      <Button title="Edit" onPress={() => navigation.navigate('ServiceForm', { service })} />
      <View style={{ marginTop: 12 }}>
        <Button title="Delete" onPress={handleDelete} color="#E63946" />
      </View>
    </View>
export default ServiceDetailScreen;
