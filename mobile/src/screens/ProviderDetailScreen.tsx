import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

type ProviderDetailRouteProp = RouteProp<RootStackParamList, 'ProviderDetail'>;

const ProviderDetailScreen: React?.FC = () => {
  const route = useRoute<ProviderDetailRouteProp>();
  const navigation = useNavigation();
  const { provider } = route?.params;

  const handleDelete = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      await deleteProvider(provider?.id);
      navigation?.navigate('ProviderList');
    } catch (e) {
      Alert?.alert('Error', 'Failed to delete provider');
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{provider?.name}</Text>
      {provider?.businessName ? <Text style={{ marginVertical: 8 }}>Business: {provider?.businessName}</Text> : null}
      {provider?.description ? <Text style={{ marginBottom: 16 }}>{provider?.description}</Text> : null}
      <Button title="Edit" onPress={() => navigation?.navigate('ProviderForm', { provider })} />
      <View style={{ marginTop: 12 }}>
        <Button title="Delete" onPress={handleDelete} color="#E63946" />
      </View>
    </View>
  );
};

export default ProviderDetailScreen;
