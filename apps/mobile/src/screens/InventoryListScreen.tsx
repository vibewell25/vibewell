import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, ActivityIndicator, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { InventoryItem } from '../types/inventory';
import { inventoryApi } from '../services/inventoryService';
import { InventoryListNavigationProp } from '../types/navigation';

const InventoryListScreen: React.FC = () => {
  const navigation = useNavigation<InventoryListNavigationProp>();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await inventoryApi.getItems();
        setItems(data);
catch (err) {
        console.error(err);
finally {
        setLoading(false);
fetchItems();
[]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Button title="Add Item" onPress={() => navigation.navigate('InventoryForm', {})} />
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('InventoryDetail', { id: item.id })}
          >
            <Text style={styles.title}>{item.name}</Text>
            <Text>Qty: {item.quantity}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: { padding: 12, borderBottomWidth: 1, borderColor: '#ccc' },
  title: { fontSize: 16, fontWeight: 'bold' },
export default InventoryListScreen;
