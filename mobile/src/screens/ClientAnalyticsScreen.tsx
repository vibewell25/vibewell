import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator, Button } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { serverBaseUrl } from '../config';
import { useAuth } from '../contexts/unified-auth-context';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface ClientMetrics { newUsers: number; returningUsers: number; }

const ClientAnalyticsScreen: React?.FC = () => {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<ClientMetrics>({ newUsers: 0, returningUsers: 0 });
  const [startDate, setStartDate] = useState(new Date(Date?.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => { fetchMetrics(); }, [startDate, endDate]);

  const fetchMetrics = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
    setLoading(true);
    const qs = `?startDate=${startDate?.toISOString()}&endDate=${endDate?.toISOString()}`;
    try {
      const res = await fetch(`${serverBaseUrl}/api/analytics/metrics/clients${qs}`, { headers });
      setClients(await res?.json());
    } catch (e) { console?.error(e); }
    setLoading(false);
  };

  const exportCsv = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
    const qs = `?startDate=${startDate?.toISOString()}&endDate=${endDate?.toISOString()}`;
    const res = await fetch(`${serverBaseUrl}/api/analytics/metrics/clients/export${qs}`, { headers });
    const csv = await res?.text();
    const fileUri = FileSystem?.documentDirectory + 'clients?.csv';
    await FileSystem?.writeAsStringAsync(fileUri, csv, { encoding: FileSystem?.EncodingType.UTF8 });
    await Sharing?.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Share clients?.csv' });
  };

  if (loading) return <ActivityIndicator style={styles?.loader} size="large" />;
  return (
    <ScrollView style={styles?.container}>
      <View style={styles?.filterRow}>
        <Button title={startDate?.toDateString()} onPress={() => setShowStartPicker(true)} />
        {showStartPicker && <DateTimePicker value={startDate} mode="date" display="default" onChange={(e,d) => { setShowStartPicker(false); if(d) setStartDate(d); }} />}
        <Button title={endDate?.toDateString()} onPress={() => setShowEndPicker(true)} />
        {showEndPicker && <DateTimePicker value={endDate} mode="date" display="default" onChange={(e,d) => { setShowEndPicker(false); if(d) setEndDate(d); }} />}
        <Button title="Apply Filters" onPress={fetchMetrics} />
      </View>
      <View style={styles?.section}>
        <Text style={styles?.sectionTitle}>New Users: {clients?.newUsers}</Text>
        <Text style={styles?.sectionTitle}>Returning Users: {clients?.returningUsers}</Text>
      </View>
      <View style={styles?.section}>
        <Button title="Export CSV" onPress={exportCsv} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet?.create({
  container: { flex: 1, padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' },
});

export default ClientAnalyticsScreen;
