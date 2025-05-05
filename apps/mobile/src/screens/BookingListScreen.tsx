import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, TextInput, ScrollView } from 'react-native';
import { fetchBookings } from '../services/bookingService';
import { Booking } from '../types/booking';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type BookingListNavProp = StackNavigationProp<RootStackParamList, 'Bookings'>;

export const BookingListScreen: React.FC = () => {
  const navigation = useNavigation<BookingListNavProp>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchBookings()
      .then(data => setBookings(data))
      .catch(console.error)
      .finally(() => setLoading(false));
[]);

  if (loading) return <ActivityIndicator size="large" color="#2A9D8F" style={styles.loader} />;

  // Apply search and status filters
  const filteredBookings = bookings.filter(item =>
    item.service.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!statusFilter || item.status === statusFilter)
return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search bookings..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        style={styles.searchInput}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <TouchableOpacity onPress={() => setStatusFilter(undefined)} style={[styles.filterButton, !statusFilter && styles.filterButtonSelected]}>
          <Text style={[styles.filterButtonText, !statusFilter && styles.filterButtonTextSelected]}>All</Text>
        </TouchableOpacity>
        {['confirmed','pending','completed','cancelled'].map(status => (
          <TouchableOpacity key={status} onPress={() => setStatusFilter(status)} style={[styles.filterButton, statusFilter === status && styles.filterButtonSelected]}>
            <Text style={[styles.filterButtonText, statusFilter === status && styles.filterButtonTextSelected]}>{status.charAt(0).toUpperCase()+status.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <FlatList
        data={filteredBookings}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('BookingDetail', { booking: item })}>
            <View style={styles.item}>
              <Text style={styles.title}>{item.service.name}</Text>
              <Text>{new Date(item.appointmentDate).toLocaleString()}</Text>
              <Text>Status: {item.status}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('NewBooking')}>
        <Text style={styles.addText}>+</Text>
      </TouchableOpacity>
    </View>
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  item: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  title: { fontSize: 18, fontWeight: 'bold' },
  addBtn: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#2A9D8F', borderRadius: 24, padding: 16 },
  addText: { color: '#fff', fontSize: 24 },
  searchInput: { height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, marginBottom: 8 },
  filterContainer: { marginBottom: 8 },
  filterButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#2A9D8F', marginRight: 8 },
  filterButtonSelected: { backgroundColor: '#2A9D8F' },
  filterButtonText: { color: '#2A9D8F' },
  filterButtonTextSelected: { color: '#fff' },
export default BookingListScreen;
