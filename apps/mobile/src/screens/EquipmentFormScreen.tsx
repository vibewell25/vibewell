import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { EquipmentItem } from '../types/equipment';
import { equipmentApi } from '../services/equipmentService';
import { EquipmentFormRouteProp, EquipmentFormNavigationProp } from '../types/navigation';

const EquipmentFormScreen: React.FC = () => {
  const route = useRoute<EquipmentFormRouteProp>();
  const navigation = useNavigation<EquipmentFormNavigationProp>();
  const { item } = route.params || {};

  const [name, setName] = useState(item.name || '');
  const [description, setDescription] = useState(item.description || '');
  const [serialNumber, setSerialNumber] = useState(item.serialNumber || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (item) {
        await equipmentApi.updateItem(item.id, { name, description, serialNumber });
        Alert.alert('Success', 'Equipment updated');
      } else {
        await equipmentApi.createItem({ name, description, serialNumber });
        Alert.alert('Success', 'Equipment created');
      }
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save equipment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{item ? 'Edit Equipment' : 'New Equipment'}</Text>
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
        placeholder="Serial Number"
        value={serialNumber}
        onChangeText={setSerialNumber}
      />
      <Button
        title={saving ? (item ? 'Updating...' : 'Creating...') : (item ? 'Update' : 'Create')}
        onPress={handleSubmit}
        disabled={saving}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 12, borderRadius: 4 },
});

export default EquipmentFormScreen;
