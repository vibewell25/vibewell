import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { payrollApi } from '../services/payrollService';
import { PayrollRecord } from '../types/payroll';
import { PayrollListNavigationProp } from '../types/navigation';

const PayrollListScreen: React?.FC = () => {
  const navigation = useNavigation<PayrollListNavigationProp>();
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await payrollApi?.getRecords();
        setRecords(data);
      } catch (err) {
        console?.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles?.container}>
      <Button title="New Record" onPress={() => navigation?.navigate('PayrollForm', {})} />
      <FlatList
        data={records}
        keyExtractor={item => item?.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles?.item}
            onPress={() => navigation?.navigate('PayrollDetail', { id: item?.id })}
          >
            <Text style={styles?.title}>{item?.userId}</Text>
            <Text>{`${item?.periodStart.split('T')[0]} - ${item?.periodEnd.split('T')[0]}`}</Text>
            <Text style={styles?.subtitle}>${item?.salary.toFixed(2)}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet?.create({
  container: { flex: 1, padding: 16 },
  item: { marginBottom: 12, padding: 12, borderBottomWidth: 1, borderColor: '#ccc' },
  title: { fontSize: 16, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: 'gray' }
});

export default PayrollListScreen;
