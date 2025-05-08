import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Divider, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const upcomingBookings = [
  {
    id: '1',
    serviceName: 'Facial Treatment',
    businessName: 'Glow Spa & Beauty',
    date: '2023-06-15',
    time: '10:00 AM',
    duration: 60,
    status: 'confirmed',
    price: 85,
  },
  {
    id: '2',
    serviceName: 'Hair Styling',
    businessName: 'Chic Hair Studio',
    date: '2023-06-18',
    time: '2:30 PM',
    duration: 45,
    status: 'pending',
    price: 65,
  },
];

const pastBookings = [
  {
    id: '3',
    serviceName: 'Manicure & Pedicure',
    businessName: 'Nail Paradise',
    date: '2023-05-28',
    time: '11:00 AM',
    duration: 50,
    status: 'completed',
    price: 55,
  },
  {
    id: '4',
    serviceName: 'Full Body Massage',
    businessName: 'Serenity Wellness',
    date: '2023-05-15',
    time: '3:00 PM',
    duration: 90,
    status: 'completed',
    price: 95,
  },
  {
    id: '5',
    serviceName: 'Haircut',
    businessName: 'Chic Hair Studio',
    date: '2023-04-30',
    time: '1:00 PM',
    duration: 30,
    status: 'cancelled',
    price: 45,
  },
];

const BookingCard = ({ booking, onPress }: any) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'pending': return '#FFC107';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#F44336';
      default: return '#757575';
    }
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.serviceName}>{booking.serviceName}</Text>
          <Chip 
            mode="outlined" 
            style={{ backgroundColor: getStatusColor(booking.status) + '20' }}
            textStyle={{ color: getStatusColor(booking.status) }}
          >
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Chip>
        </View>
        
        <Text style={styles.businessName}>{booking.businessName}</Text>
        
        <View style={styles.bookingDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{booking.date}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{booking.time}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="hourglass-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{booking.duration} min</Text>
          </View>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${booking.price}</Text>
          {booking.status === 'confirmed' && (
            <Button
              mode="text"
              compact
              onPress={(e) => {
                e.stopPropagation();
                // Handle reschedule
              }}
            >
              Reschedule
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const router = useRouter();

  const handleBookingPress = (bookingId: string) => {
    router.push({
      pathname: '/bookings/[id]',
      params: { id: bookingId }
    });
  };

  const handleNewBooking = () => {
    router.push('/bookings/new');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <Button 
          mode="contained" 
          onPress={handleNewBooking}
          style={styles.newButton}
        >
          New Booking
        </Button>
      </View>
      
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>
      
      <Divider />
      
      <FlatList
        data={activeTab === 'upcoming' ? upcomingBookings : pastBookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookingCard booking={item} onPress={() => handleBookingPress(item.id)} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>
              No {activeTab} bookings found
            </Text>
            {activeTab === 'upcoming' && (
              <Button mode="contained" onPress={handleNewBooking}>
                Book Now
              </Button>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  newButton: {
    backgroundColor: '#6200ee',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6200ee',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  businessName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  bookingDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 16,
    textAlign: 'center',
  },
}); 