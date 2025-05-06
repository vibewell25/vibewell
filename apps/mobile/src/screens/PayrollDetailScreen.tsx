import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Button, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { PayrollDetailRouteProp, PayrollDetailNavigationProp } from '@/types/navigation';
import payrollApi from '../services/payrollService';
import { PayrollRecord } from '@/types/payroll';

const PayrollDetailScreen: React.FC = () => {
  const route = useRoute<PayrollDetailRouteProp>();
  const navigation = useNavigation<PayrollDetailNavigationProp>();
  const { id } = route.params;

  const [record, setRecord] = useState<PayrollRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await payrollApi.getRecordById(id);
        setRecord(data);
catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to load payroll record');
finally {
        setLoading(false);
)();
[id]);

  const handleDelete = () => {
    Alert.alert('Confirm Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await payrollApi.deleteRecord(id);
            navigation.goBack();
catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to delete record');
]);
if (loading || !record) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Salary: ${record.salary.toFixed(2)}</Text>
      <Text>Period: {record.periodStart.split('T')[0]} - {record.periodEnd.split('T')[0]}</Text>
      <Text>Created At: {new Date(record.createdAt).toLocaleString()}</Text>
      <Text>Updated At: {new Date(record.updatedAt).toLocaleString()}</Text>
      <View style={styles.buttonRow}>
        <Button title="Edit" onPress={() => navigation.navigate('PayrollForm', { record })} />
        <Button title="Delete" onPress={handleDelete} color="red" />
      </View>
    </View>
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }
export default PayrollDetailScreen;
