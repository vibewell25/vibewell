import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Button, Alert } from 'react-native';
import { fetchBusinessHours, deleteBusinessHour } from '../services/businessHourService';
import { BusinessHour } from '../types/navigation';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BusinessHoursRouteProp, BusinessHoursNavigationProp } from '../types/navigation';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const BusinessHoursScreen: React.FC = () => {
  const route = useRoute<BusinessHoursRouteProp>();
  const navigation = useNavigation<BusinessHoursNavigationProp>();
  const { business } = route.params;
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinessHours(business.id)
      .then(setHours)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [business.id]);

  const handleDelete = async (id: string) => {
    try {
      await deleteBusinessHour(id);
      setHours(hours.filter(h => h.id !== id));
    } catch {
      Alert.alert('Error', 'Failed to delete hour');
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#2A9D8F" />;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={hours}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
            <Text>{dayNames[item.dayOfWeek]}: {item.openTime} - {item.closeTime}</Text>
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <Button title="Edit" onPress={() => navigation.navigate('BusinessHourForm', { business, hour: item })} />
              <View style={{ width: 16 }} />
              <Button title="Delete" color="#E63946" onPress={() => handleDelete(item.id)} />
            </View>
          </View>
        )}
      />
      <TouchableOpacity
        style={{ position: 'absolute', right: 16, bottom: 16, backgroundColor: '#2A9D8F', borderRadius: 24, padding: 16 }}
        onPress={() => navigation.navigate('BusinessHourForm', { business })}
      >
        <Text style={{ color: '#fff', fontSize: 24 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BusinessHoursScreen;
