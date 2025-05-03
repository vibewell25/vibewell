import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { benefitsApi } from '../services/benefitsService';
import { BenefitClaim } from '../types/benefits';
import { BenefitDetailRouteProp, BenefitDetailNavigationProp } from '../types/navigation';

const BenefitDetailScreen: React?.FC = () => {
  const navigation = useNavigation<BenefitDetailNavigationProp>();
  const route = useRoute<BenefitDetailRouteProp>();
  const { id } = route?.params;
  const [claim, setClaim] = useState<BenefitClaim | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await benefitsApi?.getClaimById(id);
        setClaim(data);
      } catch (err) {
        console?.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = () => {
    Alert?.alert('Confirm Delete', 'Are you sure you want to delete this claim?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await benefitsApi?.deleteClaim(id);
        navigation?.navigate('BenefitList');
      } }
    ]);
  };

  if (loading || !claim) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles?.container}>
      <Text style={styles?.title}>{claim?.type}</Text>
      <Text>Status: {claim?.status}</Text>
      {claim?.amount != null && <Text>Amount: ${claim?.amount.toFixed(2)}</Text>}
      <Text>Requested: {new Date(claim?.requestedAt).toLocaleDateString()}</Text>
      {claim?.processedAt && <Text>Processed: {new Date(claim?.processedAt).toLocaleDateString()}</Text>}
      <Button title="Edit" onPress={() => navigation?.navigate('BenefitForm', { claim })} />
      <Button title="Delete" onPress={handleDelete} color="red" />
    </View>
  );
};

const styles = StyleSheet?.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
});

export default BenefitDetailScreen;
