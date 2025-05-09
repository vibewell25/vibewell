import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator, Button, Dimensions } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LineChart } from 'react-native-chart-kit';
import { serverBaseUrl } from '../config';
import { useAuth } from '../contexts/unified-auth-context';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface RevenueMetrics { total: number; payment: number; subscription: number; }
interface BreakdownItem { date: string; total: number; }

const RevenueAnalyticsScreen: React.FC = () => {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState<RevenueMetrics>({ total: 0, payment: 0, subscription: 0 });
  const [breakdown, setBreakdown] = useState<BreakdownItem[]>([]);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => { fetchMetrics(); }, [startDate, endDate]);
  const fetchMetrics = async () => {
    setLoading(true);
    const qs = `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
    try {
      const [revRes, brRes] = await Promise.all([
        fetch(`${serverBaseUrl}/api/analytics/metrics/revenue${qs}`, { headers }),
        fetch(`${serverBaseUrl}/api/analytics/metrics/revenue-breakdown${qs}`, { headers }),
      ]);
      setRevenue(await revRes.json());
      setBreakdown(await brRes.json());
catch (e) {
      console.error(e);
setLoading(false);
const exportCsv = async () => {
    const qs = `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
    const res = await fetch(`${serverBaseUrl}/api/analytics/metrics/revenue/export${qs}`, { headers });
    const csv = await res.text();
    const fileUri = FileSystem.documentDirectory + 'revenue.csv';
    await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Share revenue.csv' });
if (loading) return <ActivityIndicator style={styles.loader} size="large" />;
  return (
    <ScrollView style={styles.container}>
      <View style={styles.filterRow}>
        <Button title={startDate.toDateString()} onPress={() => setShowStartPicker(true)} />
        {showStartPicker && <DateTimePicker value={startDate} mode="date" display="default" onChange={(e,d) => { setShowStartPicker(false); if(d) setStartDate(d); }} />}
        <Button title={endDate.toDateString()} onPress={() => setShowEndPicker(true)} />
        {showEndPicker && <DateTimePicker value={endDate} mode="date" display="default" onChange={(e,d) => { setShowEndPicker(false); if(d) setEndDate(d); }} />}
        <Button title="Apply Filters" onPress={fetchMetrics} />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Revenue Trend</Text>
        <LineChart
          data={{ labels: breakdown.map(b => b.date), datasets: [{ data: breakdown.map(b => b.total / 100) }] }}
          width={Dimensions.get('window').width - 32}
          height={220}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(74,144,226,${opacity})`,
            labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
bezier
          style={{ marginVertical: 8 }}
        />
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Revenue</Text>
        <Text style={styles.cardValue}>${(revenue.total / 100).toFixed(2)}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>One-Time Payments</Text>
        <Text style={styles.cardValue}>${(revenue.payment / 100).toFixed(2)}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Subscriptions Revenue</Text>
        <Text style={styles.cardValue}>${(revenue.subscription / 100).toFixed(2)}</Text>
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
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 8, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardValue: { fontSize: 20, marginTop: 4 },
export default RevenueAnalyticsScreen;
