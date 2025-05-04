import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import * as Calendar from 'expo-calendar';
import { useTheme } from '../contexts/ThemeContext';
import { getCalendarPermissions, requestCalendarPermissions, getDefaultCalendarId } from '../services/calendarService';
import { calendarApi } from '../services/api';

// @ts-ignore: use startAsync at runtime
const AuthSession = require('expo-auth-session');

const CalendarScreen: React.FC = () => {
  const { colors } = useTheme();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [calendarId, setCalendarId] = useState<string>('');
  const [events, setEvents] = useState<Calendar.Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [googleEvents, setGoogleEvents] = useState<any[]>([]);
  const [outlookLoading, setOutlookLoading] = useState<boolean>(false);
  const [outlookEvents, setOutlookEvents] = useState<any[]>([]);

  useEffect(() => {
    getCalendarPermissions()
      .then(granted => setHasPermission(granted))
      .catch(console.error);
  }, []);

  const handleEnable = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    const granted = await requestCalendarPermissions();
    setHasPermission(granted);
  };

  const handleDetectCalendar = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      const id = await getDefaultCalendarId();
      setCalendarId(id);
    } catch (err) { console.error(err); }
  };

  const handleLoadEvents = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    if (!calendarId) {
      await handleDetectCalendar();
    }
    if (!calendarId) return;
    setLoading(true);
    const now = new Date();
    const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    try {
      const evs = await Calendar.getEventsAsync([calendarId], now, end);
      setEvents(evs);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleGoogleConnect = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      setGoogleLoading(true);
      const { url } = await calendarApi.getAuthUrl();
      const result = await AuthSession.startAsync({ authUrl: url });
      if (result.type === 'success') {
        const nowISO = new Date().toISOString();
        const weekLaterISO = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const evs = await calendarApi.getUserEvents(nowISO, weekLaterISO);
        setGoogleEvents(evs);
      }
    } catch (err) {
      console.error('Google Calendar sync error', err);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleOutlookConnect = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      setOutlookLoading(true);
      const { url } = await calendarApi.getOutlookAuthUrl();
      const result = await AuthSession.startAsync({ authUrl: url });
      if (result.type === 'success') {
        const code = (result.params.code as string) || (result.code as string);
        await calendarApi.exchangeOutlookToken(code);
        const evs = await calendarApi.getOutlookEvents();
        setOutlookEvents(evs);
      }
    } catch (err) {
      console.error('Outlook Calendar sync error', err);
    } finally {
      setOutlookLoading(false);
    }
  };

  // Demo: remove synced booking event from server (by bookingId)
  const handleDeleteEvent = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');bookingId: string) => {
    try {
      await calendarApi.deleteEventFromCalendar(bookingId);
      Alert.alert('✅ Removed from calendar');
    } catch (err) {
      console.error(err);
      Alert.alert('Failed to remove event');
    }
  };

  if (hasPermission === null) {
    return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} size="large" />;
  }

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={{ color: colors.text }}>Calendar permission required</Text>
        <Button title="Enable Calendar Sync" onPress={handleEnable} color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button title="Connect Google Calendar" onPress={handleGoogleConnect} color={colors.primary} />
      {googleLoading && <ActivityIndicator style={{ marginVertical: 16 }} color={colors.primary} />}
      {googleEvents.length > 0 && (
        <>
          <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 8 }}>Google Events:</Text>
          <FlatList
            data={googleEvents}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text style={{ color: colors.text, fontWeight: 'bold' }}>{item.summary}</Text>
                <Text style={{ color: colors.text }}>{new Date(item.start.dateTime || item.start.date).toLocaleString()}</Text>
              </View>
            )}
          />
        </>
      )}
      <Button title="Connect Outlook Calendar" onPress={handleOutlookConnect} color={colors.primary} />
      {outlookLoading && <ActivityIndicator style={{ marginVertical: 16 }} color={colors.primary} />}
      {outlookEvents.length > 0 && (
        <>
          <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 8 }}>Outlook Events:</Text>
          <FlatList
            data={outlookEvents}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text style={{ color: colors.text, fontWeight: 'bold' }}>{item.subject}</Text>
                <Text style={{ color: colors.text }}>{new Date(item.start.dateTime || item.start.date).toLocaleString()}</Text>
              </View>
            )}
          />
        </>
      )}
      <Button title="Remove booking from calendar" onPress={() => handleDeleteEvent('YOUR_BOOKING_ID')} color={colors.primary} />
      {/* Then detect/load local events */}
      <Button title="Detect Calendar" onPress={handleDetectCalendar} color={colors.primary} />
      {calendarId ? <Text style={{ color: colors.text, marginTop: 8 }}>Calendar ID: {calendarId}</Text> : null}
      <Button title="Load Events" onPress={handleLoadEvents} color={colors.primary} />
      {loading ? <ActivityIndicator style={{ marginTop: 16 }} color={colors.primary} /> : null}
      <FlatList
        data={events}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={{ color: colors.text, fontWeight: 'bold' }}>{item.title}</Text>
            <Text style={{ color: colors.text }}>{new Date(item.startDate).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: { marginBottom: 12, padding: 8, borderBottomWidth: 1, borderColor: '#ccc' },
});

export default CalendarScreen;
