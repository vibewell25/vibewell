import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { PayrollFormRouteProp, PayrollFormNavigationProp } from '../types/navigation';
import payrollApi from '../services/payrollService';
import { PayrollRecord } from '../types/payroll';

const PayrollFormScreen: React.FC = () => {
  const route = useRoute<PayrollFormRouteProp>();
  const navigation = useNavigation<PayrollFormNavigationProp>();
  const { record } = route.params;
  const isEdit = !!record;

  const [salary, setSalary] = useState<string>(record?.salary.toString() || '');
  const [periodStart, setPeriodStart] = useState<string>(record?.periodStart.split('T')[0] || '');
  const [periodEnd, setPeriodEnd] = useState<string>(record?.periodEnd.split('T')[0] || '');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!salary.trim() || !periodStart.trim() || !periodEnd.trim()) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    setLoading(true);
    try {
      let result: PayrollRecord;
      const payload = {
        salary: parseFloat(salary),
        periodStart: periodStart,
        periodEnd: periodEnd
      };
      if (isEdit && record) {
        result = await payrollApi.updateRecord(record.id, payload);
      } else {
        result = await payrollApi.createRecord(payload);
      }
      navigation.navigate('PayrollDetail', { id: result.id });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save payroll record');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Salary"
        value={salary}
        onChangeText={setSalary}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Period Start (YYYY-MM-DD)"
        value={periodStart}
        onChangeText={setPeriodStart}
      />
      <TextInput
        style={styles.input}
        placeholder="Period End (YYYY-MM-DD)"
        value={periodEnd}
        onChangeText={setPeriodEnd}
      />
      <Button title={isEdit ? 'Update Record' : 'Create Record'} onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4, marginBottom: 12 }
});

export default PayrollFormScreen;
