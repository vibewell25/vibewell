import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStripe } from '@stripe/stripe-react-native';
import { serverBaseUrl } from '../config';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  brand?: string;
  expiryMonth?: string;
  expiryYear?: string;
  isDefault: boolean;
const PaymentMethodsScreen: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
[]);

  const loadPaymentMethods = async () => {
    try {
      const saved = await AsyncStorage.getItem('@vibewell/payment_methods');
      if (saved) {
        setPaymentMethods(JSON.parse(saved));
else {
        // Mock data for demonstration
        const mockMethods: PaymentMethod[] = [
          {
            id: '1',
            type: 'card',
            last4: '4242',
            brand: 'visa',
            expiryMonth: '12',
            expiryYear: '24',
            isDefault: true
{
            id: '2',
            type: 'card',
            last4: '8888',
            brand: 'mastercard',
            expiryMonth: '06',
            expiryYear: '25',
            isDefault: false
];
        setPaymentMethods(mockMethods);
        await AsyncStorage.setItem('@vibewell/payment_methods', JSON.stringify(mockMethods));
catch (error) {
      console.error('Error loading payment methods:', error);
      Alert.alert('Error', 'Failed to load payment methods');
finally {
      setLoading(false);
const handleSetDefault = async (id: string) => {
    try {
      const updated = paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === id
));
      setPaymentMethods(updated);
      await AsyncStorage.setItem('@vibewell/payment_methods', JSON.stringify(updated));
catch (error) {
      console.error('Error setting default payment method:', error);
      Alert.alert('Error', 'Failed to set default payment method');
const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = paymentMethods.filter(method => method.id !== id);
              setPaymentMethods(updated);
              await AsyncStorage.setItem('@vibewell/payment_methods', JSON.stringify(updated));
catch (error) {
              console.error('Error deleting payment method:', error);
              Alert.alert('Error', 'Failed to delete payment method');
]
const getCardIconName = (brand?: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return 'cc-visa';
      case 'mastercard':
        return 'cc-mastercard';
      case 'amex':
        return 'cc-amex';
      default:
        return 'credit-card';
const handleAddPaymentMethod = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${serverBaseUrl}/api/stripe/setup-intent`, { method: 'POST' });
      const { clientSecret } = await res.json();
      const { error: initError } = await initPaymentSheet({
        setupIntentClientSecret: clientSecret,
        merchantDisplayName: 'VibeWell',
if (initError) {
        Alert.alert('Error', initError.message);
        return;
const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        Alert.alert('Error', presentError.message);
        return;
Alert.alert('Success', 'Payment method added');
      loadPaymentMethods();
catch (error) {
      console.error('Error adding payment method:', error);
      Alert.alert('Error', 'Failed to add payment method');
finally {
      setLoading(false);
return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather
            name="arrow-left"
            size={24}
            color={isDarkMode ? '#FFFFFF' : '#000000'}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
          Payment Methods
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {paymentMethods.map(method => (
          <View
            key={method.id}
            style={[
              styles.card,
              { backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5' }
            ]}
          >
            <View style={styles.cardHeader}>
              <FontAwesome
                name={getCardIconName(method.brand)}
                size={40}
                color={isDarkMode ? '#FFFFFF' : '#000000'}
                style={styles.cardImage}
              />
              {method.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              )}
            </View>

            <Text style={[styles.cardNumber, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              •••• •••• •••• {method.last4}
            </Text>
            
            <Text style={[styles.cardExpiry, { color: isDarkMode ? '#BBBBBB' : '#666666' }]}>
              Expires {method.expiryMonth}/{method.expiryYear}
            </Text>

            <View style={styles.cardActions}>
              {!method.isDefault && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleSetDefault(method.id)}
                >
                  <Text style={styles.actionButtonText}>Set as Default</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(method.id)}
              >
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[
            styles.addButton,
            { backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5' }
          ]}
          onPress={handleAddPaymentMethod}
        >
          <Feather name="plus" size={24} color={isDarkMode ? '#FFF' : '#000'} />
          <Text style={[
            styles.addButtonText,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            Add New Payment Method
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
const styles = StyleSheet.create({
  container: {
    flex: 1,
header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
backButton: {
    marginRight: 16,
title: {
    fontSize: 20,
    fontWeight: 'bold',
content: {
    padding: 16,
card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
cardImage: {
    width: 40,
    height: 25,
defaultBadge: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
defaultText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
cardNumber: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
cardExpiry: {
    fontSize: 14,
    marginBottom: 16,
cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
actionButton: {
    marginLeft: 12,
actionButtonText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
deleteButton: {
    marginLeft: 16,
deleteButtonText: {
    color: '#FF4444',
addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
export default PaymentMethodsScreen; 