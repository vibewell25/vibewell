import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { serverBaseUrl } from '../config';
import { useAuth } from '../contexts/unified-auth-context';
import { Dimensions } from 'react-native';

interface DataItem { month: string; count: number; }

const BookingTrendScreen: React.FC = () => {
  const { token } = useAuth();
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${serverBaseUrl}/api/analytics/bookings/monthly`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json: DataItem[] = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (loading) return <ActivityIndicator style={styles.loader} size="large" />;
  return (
    <View style={styles.container}>
      <LineChart
        data={{ labels: data.map(d => d.month), datasets: [{ data: data.map(d => d.count) }] }}
        width={Dimensions.get('window').width - 32}
        height={220}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(74,144,226,${opacity})`,
          labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
        }}
        style={{ marginVertical: 8 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default BookingTrendScreen;
