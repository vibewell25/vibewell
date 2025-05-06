import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types/navigation';

type MembershipNavigationProp = StackNavigationProp<RootStackParamList, 'Membership'>;

const MEMBERSHIP_OPTIONS = [
  { key: 'monthly', label: 'Monthly Membership', description: 'Unlimited access + 100 bonus points', price: '$9.99/mo', priceId: 'price_monthly_123' },
  { key: 'annual', label: 'Annual Membership', description: '2 months free + 200 bonus points', price: '$99.99/yr', priceId: 'price_annual_123' },
];

const MembershipScreen: React.FC = () => {
  const navigation = useNavigation<MembershipNavigationProp>();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Membership Plans</Text>
      {MEMBERSHIP_OPTIONS.map(opt => (
        <View key={opt.key} style={styles.option}>
          <Text style={styles.optionTitle}>{opt.label}</Text>
          <Text style={styles.description}>{opt.description}</Text>
          <Text style={styles.price}>{opt.price}</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Payment', { priceId: opt.priceId })}>
            <Feather name="credit-card" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Subscribe</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  option: { marginBottom: 24, padding: 16, borderRadius: 8, backgroundColor: '#f0f0f0' },
  optionTitle: { fontSize: 20, fontWeight: '600' },
  description: { fontSize: 14, color: '#666', marginVertical: 8 },
  price: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4F46E5', padding: 12, borderRadius: 6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
export default MembershipScreen;
