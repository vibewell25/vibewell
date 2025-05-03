import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { fetchProviders } from '../services/providerService';
import { Provider } from '../types/navigation';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type BusinessStackNavigationProp = StackNavigationProp<RootStackParamList, 'ProviderList'>;

const ProviderListScreen: React?.FC = () => {
  const navigation = useNavigation<BusinessStackNavigationProp>();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders()
      .then(setProviders)
      .catch(console?.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#2A9D8F" />;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={providers}
        keyExtractor={(item) => item?.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation?.navigate('ProviderDetail', { provider: item })}>
            <View style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
              <Text style={{ fontSize: 18 }}>{item?.name}</Text>
              <Text style={{ color: 'gray' }}>{item?.businessName}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={{ position: 'absolute', right: 16, bottom: 16, backgroundColor: '#2A9D8F', borderRadius: 24, padding: 16 }}
        onPress={() => navigation?.navigate('ProviderForm')}
      >
        <Text style={{ color: '#fff', fontSize: 24 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProviderListScreen;
