import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { serverBaseUrl } from '../config';
import { useAuth } from '../contexts/unified-auth-context';
import { trackEvent } from '../services/analyticsService';

type Subscription = {
  stripeSubscriptionId: string;
  priceId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
};

const SubscriptionsScreen: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subs, setSubs] = useState<Subscription[]>([]);

  const fetchSubs = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    await trackEvent('ViewSubscriptions', {});
    setLoading(true);
    try {
      const res = await fetch(`${serverBaseUrl}/api/stripe/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSubs(data.subscriptions);
    } catch {
      Alert.alert('Error', 'Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const cancelSub = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');id: string) => {
    try {
      const res = await fetch(`${serverBaseUrl}/api/stripe/subscriptions/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subscriptionId: id }),
      });
      if (!res.ok) throw new Error();
      Alert.alert('Canceled', 'Subscription canceled');
      await trackEvent('SubscriptionCanceled', { subscriptionId: id });
      fetchSubs();
    } catch {
      Alert.alert('Error', 'Failed to cancel subscription');
    }
  };

  useEffect(() => { fetchSubs(); }, []);

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <FlatList
      data={subs}
      keyExtractor={item => item.stripeSubscriptionId}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text>Plan: {item.priceId}</Text>
          <Text>Status: {item.status}</Text>
          <Text>
            Period: {new Date(item.currentPeriodStart).toLocaleDateString()} - {new Date(item.currentPeriodEnd).toLocaleDateString()}
          </Text>
          {item.status !== 'canceled' && (<Button title="Cancel" onPress={() => cancelSub(item.stripeSubscriptionId)} />)}
        </View>
      )}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  item: { marginBottom: 16, padding: 16, backgroundColor: '#fff', borderRadius: 8, elevation: 2 },
});

export default SubscriptionsScreen;
