import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import Clipboard from 'expo-clipboard';
import { useAuth } from '../contexts/unified-auth-context';
import { serverBaseUrl } from '../config';
import { isOnline, addToSyncQueue } from '../services/offline-storage';

const ReferralScreen: React.FC = () => {
  const { token } = useAuth();
  const [code, setCode] = useState<string>('');
  const [input, setInput] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${serverBaseUrl}/api/referrals/code`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setCode(data.referralCode);
      } catch {
        Alert.alert('Error', 'Failed to fetch referral code');
      }
    })();
  }, []);

  const handleCopy = () => {
    Clipboard.setString(code);
    Alert.alert('Copied', 'Referral code copied to clipboard');
  };

  const handleApply = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      if (!(await isOnline())) {
        await addToSyncQueue('/api/referrals/apply', 'POST', { code: input });
        Alert.alert('Offline', 'Referral applied when back online');
        return;
      }
      const res = await fetch(`${serverBaseUrl}/api/referrals/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: input })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      Alert.alert('Success', `You earned ${data.rewardPoints} points`);
    } catch {
      Alert.alert('Error', 'Failed to apply referral');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Your Referral Code:</Text>
      <View style={styles.row}>
        <Text style={styles.code}>{code}</Text>
        <Button title="Copy" onPress={handleCopy} />
      </View>
      <Text style={[styles.label, { marginTop: 20 }]}>Apply Friend's Code:</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Enter code"
          value={input}
          onChangeText={setInput}
        />
        <Button title="Apply" onPress={handleApply} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { fontSize: 16, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  code: { fontSize: 18, flex: 1, marginRight: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8, marginRight: 8 }
});

export default ReferralScreen;
