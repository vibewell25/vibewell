import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StaffFormRouteProp, StaffFormNavigationProp } from '../types/navigation';
import { createStaff, updateStaff } from '../services/staffService';

const StaffFormScreen: React.FC = () => {
  const route = useRoute<StaffFormRouteProp>();
  const navigation = useNavigation<StaffFormNavigationProp>();
  const { business, staff } = route.params;

  const [name, setName] = useState(staff.name ?? '');
  const [role, setRole] = useState(staff.role ?? '');
  const [email, setEmail] = useState(staff.email ?? '');
  const [phone, setPhone] = useState(staff.phone ?? '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (staff) {
        await updateStaff(staff.id, { name, role, email, phone });
else {
        await createStaff({ businessId: business.id, name, role, email, phone });
navigation.goBack();
catch {
      Alert.alert('Error', 'Failed to save staff');
finally {
      setLoading(false);
return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>Name</Text>
      <TextInput value={name} onChangeText={setName} style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 8 }} />
      <Text>Role</Text>
      <TextInput value={role} onChangeText={setRole} style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 8 }} />
      <Text>Email</Text>
      <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 8 }} />
      <Text>Phone</Text>
      <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 16, padding: 8 }} />
      <Button title={staff ? 'Update Staff' : 'Add Staff'} onPress={handleSubmit} disabled={loading || !name.trim() || !role.trim()} />
    </View>
export default StaffFormScreen;
