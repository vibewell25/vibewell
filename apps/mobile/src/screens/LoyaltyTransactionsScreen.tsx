import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import { serverBaseUrl } from '../config';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/unified-auth-context';

interface Tier {
  id: string;
  name: string;
  discount: number;
}

interface Transaction {
  id: string;
  points: number;
  type: 'EARN' | 'REDEEM';
  createdAt: string;
  tier?: Tier;
}

const LoyaltyTransactionsScreen: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user) return;
      try {
        const res = await fetch(
          `${serverBaseUrl}/api/loyalty/transactions?userId=${user.id}`
        );
        const data = await res.json();
        setTransactions(data.transactions || []);
      } catch (err) {
        Alert.alert('Error', 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return <ActivityIndicator size="large" />;

  const balance = transactions.reduce((sum, tx) =>
    sum + (tx.type === 'EARN' ? tx.points : -tx.points),
    0
  );

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? '#121212' : '#FFFFFF', padding: 16 }}>
      <Text style={{ color: isDarkMode ? '#FFFFFF' : '#000000', fontSize: 18, marginBottom: 12 }}>
        Points Balance: {balance}
      </Text>
      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }}>
              {new Date(item.createdAt).toLocaleDateString()} - {item.type}: {item.points} pts
            </Text>
            {item.tier && (
              <Text style={{ color: isDarkMode ? '#BBBBBB' : '#666666' }}>
                Tier: {item.tier.name}
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
};

export default LoyaltyTransactionsScreen;
