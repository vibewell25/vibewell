import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, Button } from 'react-native';
import { serverBaseUrl } from '../config';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/unified-auth-context';
import { isOnline, addToSyncQueue } from '../services/offline-storage';

interface Tier {
  id: string;
  name: string;
  requiredPoints: number;
  discount: number;
const LoyaltyTiersScreen: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { token } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [balanceRes, tiersRes] = await Promise.all([
          fetch(`${serverBaseUrl}/api/loyalty/balance`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${serverBaseUrl}/api/loyalty/tiers`)
        ]);
        const balanceData = await balanceRes.json();
        setBalance(balanceData.balance ?? 0);
        const tiersData = await tiersRes.json();
        setTiers(tiersData.tiers || []);
catch (err) {
        Alert.alert('Error', 'Failed to load loyalty data');
finally {
        setLoading(false);
)();
[]);

  const redeemTier = async (tierId: string, points: number) => {
    if (!(await isOnline())) {
      await addToSyncQueue('/api/loyalty/redeem', 'POST', { tierId });
      Alert.alert('Offline', 'Redemption queued and will complete when online');
      return;
try {
      const res = await fetch(`${serverBaseUrl}/api/loyalty/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tierId }),
if (!res.ok) throw new Error();
      const data = await res.json();
      setBalance(data.balance);
      Alert.alert('Success', `Redeemed ${points} pts`);
catch {
      Alert.alert('Error', 'Redemption failed');
if (loading) return <ActivityIndicator size="large" />;

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? '#121212' : '#FFFFFF', padding: 16 }}>
      <Text style={{ fontSize: 18 }}>Your Points: {balance}</Text>
      <FlatList
        data={tiers}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: isDarkMode ? '#FFFFFF' : '#000000', fontSize: 18 }}>
              {item.name}
            </Text>
            <Text style={{ color: isDarkMode ? '#BBBBBB' : '#666666' }}>
              Requires {item.requiredPoints} pts — {item.discount * 100}% off
            </Text>
            {item.requiredPoints <= balance && (
              <Button
                title="Redeem"
                onPress={() => redeemTier(item.id, item.requiredPoints)}
                disabled={item.requiredPoints > balance}
              />
            )}
          </View>
        )}
      />
    </View>
export default LoyaltyTiersScreen;
