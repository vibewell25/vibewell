import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ProviderFormRouteProp, ProviderFormNavigationProp } from '../types/navigation';
import { createProvider, updateProvider } from '../services/providerService';

const ProviderFormScreen: React.FC = () => {
  const route = useRoute<ProviderFormRouteProp>();
  const navigation = useNavigation<ProviderFormNavigationProp>();
  const existing = route.params.provider;
  const [name, setName] = useState(existing.name ?? '');
  const [businessName, setBusinessName] = useState(existing.businessName ?? '');
  const [description, setDescription] = useState(existing.description ?? '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (existing) {
        await updateProvider(existing.id, { name, businessName, description });
      } else {
        await createProvider({ name, businessName, description });
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save provider');
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
      <Text style={{ marginBottom: 4 }}>Business Name</Text>
      <TextInput
        value={businessName}
        onChangeText={setBusinessName}
        style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 8 }}
      />
      <Text style={{ marginBottom: 4 }}>Description</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 16, padding: 8 }}
        multiline
      />
      <Button
        title={existing ? 'Update Provider' : 'Create Provider'}
        onPress={handleSubmit}
        disabled={loading || !name.trim()}
      />
    </View>
  );
};

export default ProviderFormScreen;
