import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ServiceFormRouteProp, ServiceFormNavigationProp } from '../types/navigation';
import { createService, updateService } from '../services/serviceService';

const ServiceFormScreen: React.FC = () => {
  const route = useRoute<ServiceFormRouteProp>();
  const navigation = useNavigation<ServiceFormNavigationProp>();
  const existing = route.params.service;
  const [name, setName] = useState(existing.name ?? '');
  const [price, setPrice] = useState(existing.price.toString() ?? '');
  const [duration, setDuration] = useState(existing.duration.toString() ?? '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      setLoading(true);
      const priceNum = parseFloat(price);
      const durationNum = parseInt(duration, 10);
      if (existing) {
        await updateService(existing.id, { name, price: priceNum, duration: durationNum });
      } else {
        // For now, set providerId to empty or handle accordingly
        await createService({ providerId: '', name, price: priceNum, duration: durationNum });
      }
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ marginBottom: 4 }}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 8 }}
      />
      <Text style={{ marginBottom: 4 }}>Price</Text>
      <TextInput
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 8 }}
      />
      <Text style={{ marginBottom: 4 }}>Duration (minutes)</Text>
      <TextInput
        value={duration}
        onChangeText={setDuration}
        keyboardType="numeric"
        style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 16, padding: 8 }}
      />
      <Button
        title={existing ? 'Update Service' : 'Create Service'}
        onPress={handleSubmit}
        disabled={loading || !name.trim() || !price || !duration}
      />
    </View>
  );
};

export default ServiceFormScreen;
