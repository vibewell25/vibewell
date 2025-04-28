import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import communityApi from '../services/communityService';
import { CommunityEvent } from '../types/community';
import { EventListNavigationProp } from '../types/navigation';

const EventListScreen: React.FC = () => {
  const navigation = useNavigation<EventListNavigationProp>();
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await communityApi.getEvents();
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Button title="New Event" onPress={() => navigation.navigate('EventForm', {})} />
      <FlatList
        data={events}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('EventDetail', { id: item.id })}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{new Date(item.startAt).toLocaleDateString()}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: { marginBottom: 12, padding: 12, borderBottomWidth: 1, borderColor: '#ccc' },
  title: { fontSize: 16, fontWeight: 'bold' },
  subtitle: { fontSize: 12, color: 'gray' }
});

export default EventListScreen;
