import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BusinessHourFormRouteProp, BusinessHourFormNavigationProp } from '../types/navigation';
import { createBusinessHour, updateBusinessHour } from '../services/businessHourService';

const BusinessHourFormScreen: React.FC = () => {
  const route = useRoute<BusinessHourFormRouteProp>();
  const navigation = useNavigation<BusinessHourFormNavigationProp>();
  const { business, hour } = route.params;

  const [dayOfWeek, setDayOfWeek] = useState(hour.dayOfWeek.toString() ?? '0');
  const [openTime, setOpenTime] = useState(hour.openTime ?? '');
  const [closeTime, setCloseTime] = useState(hour.closeTime ?? '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const dow = parseInt(dayOfWeek, 10);
      if (hour) {
        await updateBusinessHour(hour.id, { dayOfWeek: dow, openTime, closeTime });
      } else {
        await createBusinessHour({ businessId: business.id, dayOfWeek: dow, openTime, closeTime });
      }
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save business hour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>Day of Week (0 = Sun ... 6 = Sat)</Text>
      <TextInput
        value={dayOfWeek}
        onChangeText={setDayOfWeek}
        keyboardType="numeric"
        style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 8 }}
      />
      <Text>Open Time (HH:MM)</Text>
      <TextInput
        value={openTime}
        onChangeText={setOpenTime}
        style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 8 }}
      />
      <Text>Close Time (HH:MM)</Text>
      <TextInput
        value={closeTime}
        onChangeText={setCloseTime}
        style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 16, padding: 8 }}
      />
      <Button
        title={hour ? 'Update Hour' : 'Create Hour'}
        onPress={handleSubmit}
        disabled={loading || !openTime.trim() || !closeTime.trim()}
      />
    </View>
  );
};

export default BusinessHourFormScreen;
