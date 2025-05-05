import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { InventoryItem } from '../types/inventory';
import { inventoryApi } from '../services/inventoryService';
import { InventoryDetailRouteProp, InventoryDetailNavigationProp } from '../types/navigation';

const InventoryDetailScreen: React.FC = () => {
  const route = useRoute<InventoryDetailRouteProp>();
  const navigation = useNavigation<InventoryDetailNavigationProp>();
  const { id } = route.params;

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await inventoryApi.getItemById(id);
        setItem(data);
catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to load item');
finally {
        setLoading(false);
)();
[id]);

  const confirmDelete = () => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: handleDelete },
    ]);
const handleDelete = async () => {
    setDeleting(true);
    try {
      await inventoryApi.deleteItem(id);
      Alert.alert('Success', 'Item deleted');
      navigation.goBack();
catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to delete item');
finally {
      setDeleting(false);
if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{item.name}</Text>
      <Text>Description: {item.description}</Text>
      <Text>Quantity: {item.quantity}</Text>
      <Button title="Edit" onPress={() => navigation.navigate('InventoryForm', { item: item! })} />
      <Button title={deleting ? 'Deleting...' : 'Delete'} onPress={confirmDelete} color="red" disabled={deleting} />
    </View>
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
export default InventoryDetailScreen;
