import React, { useState } from 'react';
import { View, Button, ActivityIndicator, Alert, Linking } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { PaymentRouteProp } from '@/types/navigation';
import { createCheckoutSession } from '../services/paymentService';

const PaymentScreen: React.FC = () => {
  const route = useRoute<PaymentRouteProp>();
  const { priceId, mode = 'payment' } = route.params;
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const url = await createCheckoutSession(
        priceId,
        'https://your-success-url',
        'https://your-cancel-url',
        mode
await Linking.openURL(url);
catch (err) {
      Alert.alert('Error', 'Failed to start checkout');
finally {
      setLoading(false);
return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Pay Now" onPress={handlePayment} />
      )}
    </View>
export default PaymentScreen;
