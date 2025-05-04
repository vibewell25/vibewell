import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { getNotifications, markNotificationRead, NotificationItem } from '../services/notificationsApiService';
import { useTheme } from '../contexts/ThemeContext';

const NotificationsScreen: React.FC = () => {
  const { colors } = useTheme();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      const data = await getNotifications();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleRead = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');id: string) => {
    try {
      await markNotificationRead(id);
      setItems(prev => prev.map(item => item.id === id ? { ...item, read: true } : item));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} size="large" />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.item, { backgroundColor: item.read ? colors.border : colors.card }]}>          
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: item.read ? 'normal' : 'bold' }}>{item.title}</Text>
              <Text style={{ color: colors.text }}>{item.message}</Text>
              <Text style={{ color: colors.text, fontSize: 12 }}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
            {!item.read && <Button title="Mark Read" onPress={() => handleRead(item.id)} color={colors.primary} />}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: '#ccc' }
});

export default NotificationsScreen;
