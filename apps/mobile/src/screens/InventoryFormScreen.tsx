import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { InventoryItem } from '@/types/inventory';
import { inventoryApi } from '../services/inventoryService';
import { InventoryFormRouteProp, InventoryFormNavigationProp } from '@/types/navigation';

const InventoryFormScreen: React.FC = () => {
  const navigation = useNavigation<InventoryFormNavigationProp>();
  const route = useRoute<InventoryFormRouteProp>();
  const { item } = route.params || {};

  const [name, setName] = useState(item.name || '');
  const [description, setDescription] = useState(item.description || '');
  const [quantity, setQuantity] = useState(String(item.quantity || ''));
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (item) {
        await inventoryApi.updateItem(item.id, { name, description, quantity: Number(quantity) });
        Alert.alert('Success', 'Item updated');
else {
        await inventoryApi.createItem({ name, description, quantity: Number(quantity) });
        Alert.alert('Success', 'Item created');
navigation.goBack();
catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save item');
finally {
      setSaving(false);
return (
    <View style={styles.container}>
      <Text style={styles.title}>{item ? 'Edit Item' : 'New Item'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Quantity"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
      />
      <Button
        title={saving ? (item ? 'Updating...' : 'Creating...') : (item ? 'Update' : 'Create')}
        onPress={handleSubmit}
        disabled={saving}
      />
    </View>
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 12, borderRadius: 4 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
export default InventoryFormScreen;
