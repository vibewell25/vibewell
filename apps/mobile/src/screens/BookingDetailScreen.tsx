import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { BookingDetailRouteProp } from '../types/navigation';

const BookingDetailScreen: React?.FC = () => {
  const route = useRoute<BookingDetailRouteProp>();
  const { booking } = route?.params;

  return (
    <View style={styles?.container}>
      <Text style={styles?.title}>{booking?.service.name}</Text>
      <Text>Date: {new Date(booking?.appointmentDate).toLocaleString()}</Text>
      <Text>Status: {booking?.status}</Text>
      {booking?.specialRequests ? <Text>Notes: {booking?.specialRequests}</Text> : null}
    </View>
  );
};

const styles = StyleSheet?.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
});

export default BookingDetailScreen;
