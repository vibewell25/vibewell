import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { benefitsApi } from '../services/benefitsService';
import { BenefitClaim } from '@/types/benefits';
import { BenefitListNavigationProp } from '@/types/navigation';

const BenefitListScreen: React.FC = () => {
  const navigation = useNavigation<BenefitListNavigationProp>();
  const [claims, setClaims] = useState<BenefitClaim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await benefitsApi.getClaims();
        setClaims(data);
catch (err) {
        console.error(err);
finally {
        setLoading(false);
)();
[]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Button title="New Claim" onPress={() => navigation.navigate('BenefitForm', {})} />
      <FlatList
        data={claims}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('BenefitDetail', { id: item.id })}
          >
            <Text style={styles.title}>{item.type}</Text>
            <Text>{item.status}</Text>
            {item.amount != null && <Text>${item.amount.toFixed(2)}</Text>}
          </TouchableOpacity>
        )}
      />
    </View>
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: { marginBottom: 12, padding: 12, borderBottomWidth: 1, borderColor: '#ccc' },
  title: { fontSize: 16, fontWeight: 'bold' },
export default BenefitListScreen;
