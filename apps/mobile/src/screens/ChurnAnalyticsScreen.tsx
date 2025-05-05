import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator, Button } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { serverBaseUrl } from '../config';
import { useAuth } from '../contexts/unified-auth-context';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const ChurnAnalyticsScreen: React.FC = () => {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };
  const [loading, setLoading] = useState(true);
  const [churn, setChurn] = useState<{ cancellations: number; totalSubs: number; churnRate: number }>({ cancellations: 0, totalSubs: 0, churnRate: 0 });
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  useEffect(() => { fetchMetrics(); }, [startDate, endDate]);
  const fetchMetrics = async () => {
    setLoading(true);
    const qs = `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
    try {
      const res = await fetch(`${serverBaseUrl}/api/analytics/metrics/subscription-churn${qs}`, { headers });
      setChurn(await res.json());
catch (e) { console.error(e); }
    setLoading(false);
const exportCsv = async () => {
    const qs = `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
    const res = await fetch(`${serverBaseUrl}/api/analytics/metrics/subscription-churn/export${qs}`, { headers });
    const csv = await res.text();
    const uri = FileSystem.documentDirectory + 'churn.csv';
    await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Share churn.csv' });
if (loading) return <ActivityIndicator style={styles.loader} size="large" />;
  return (
    <ScrollView style={styles.container}>
      <View style={styles.filterRow}>
        <Button title={startDate.toDateString()} onPress={() => setShowStart(true)} />
        {showStart && <DateTimePicker value={startDate} mode="date" display="default" onChange={(e,d) => { setShowStart(false); if(d) setStartDate(d); }} />}
        <Button title={endDate.toDateString()} onPress={() => setShowEnd(true)} />
        {showEnd && <DateTimePicker value={endDate} mode="date" display="default" onChange={(e,d) => { setShowEnd(false); if(d) setEndDate(d); }} />}
        <Button title="Apply Filters" onPress={fetchMetrics} />
      </View>
      <View style={styles.section}>
        <Text>Cancellations: {churn.cancellations}</Text>
        <Text>Total Subs: {churn.totalSubs}</Text>
        <Text>Churn Rate: {(churn.churnRate * 100).toFixed(2)}%</Text>
      </View>
      <View style={styles.section}>
        <Button title="Export CSV" onPress={exportCsv} />
      </View>
    </ScrollView>
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  section: { marginTop: 16 },
export default ChurnAnalyticsScreen;
