import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Button, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import communityApi from '../services/communityService';
import { CommunityEvent } from '../types/community';
import { EventDetailRouteProp, EventDetailNavigationProp } from '../types/navigation';

const EventDetailScreen: React.FC = () => {
  const route = useRoute<EventDetailRouteProp>();
  const navigation = useNavigation<EventDetailNavigationProp>();
  const { id } = route.params;

  const [event, setEvent] = useState<CommunityEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await communityApi.getEventById(id);
        setEvent(data);
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to load event');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      await communityApi.deleteEvent(id);
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to delete event');
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.text}>Description: {event.description || '-'}</Text>
      <Text style={styles.text}>Starts: {new Date(event!.startAt).toLocaleString()}</Text>
      <Text style={styles.text}>Ends: {event.endAt ? new Date(event.endAt).toLocaleString() : 'N/A'}</Text>
      <Text style={styles.text}>Location: {event.location || '-'}</Text>
      <View style={styles.buttonRow}>
        <Button title="Edit" onPress={() => navigation.navigate('EventForm', { event: event! })} />
        <Button title="Delete" onPress={handleDelete} color="red" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  text: { fontSize: 14, marginBottom: 4 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }
});

export default EventDetailScreen;
