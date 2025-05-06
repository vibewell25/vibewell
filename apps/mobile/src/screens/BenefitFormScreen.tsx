import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { benefitsApi } from '../services/benefitsService';
import { BenefitClaim } from '@/types/benefits';
import { BenefitFormRouteProp, BenefitFormNavigationProp } from '@/types/navigation';

const BenefitFormScreen: React.FC = () => {
  const navigation = useNavigation<BenefitFormNavigationProp>();
  const route = useRoute<BenefitFormRouteProp>();
  const { claim } = route.params;
  const isEdit = !!claim;

  const [type, setType] = useState<string>(claim.type || '');
  const [status, setStatus] = useState<string>(claim.status || 'pending');
  const [amount, setAmount] = useState<string>(claim.amount.toString() || '');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!type.trim()) {
      Alert.alert('Error', 'Type is required.');
      return;
setLoading(true);
    try {
      let result: BenefitClaim;
      if (isEdit && claim) {
        result = await benefitsApi.updateClaim(claim.id, {
          type,
          status,
          amount: amount ? parseFloat(amount) : undefined,
else {
        result = await benefitsApi.createClaim({
          type,
          status,
          amount: amount ? parseFloat(amount) : undefined,
navigation.navigate('BenefitDetail', { id: result.id });
catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save benefit claim');
finally {
      setLoading(false);
if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Type</Text>
      <TextInput
        style={styles.input}
        value={type}
        onChangeText={setType}
        placeholder="e.g. Health reimbursement"
      />
      <Text style={styles.label}>Status</Text>
      <TextInput
        style={styles.input}
        value={status}
        onChangeText={setStatus}
        placeholder="pending, approved, denied"
      />
      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        placeholder="0.00"
        keyboardType="numeric"
      />
      <Button
        title={isEdit ? 'Update Claim' : 'Create Claim'}
        onPress={handleSubmit}
      />
    </View>
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { fontSize: 14, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
export default BenefitFormScreen;
