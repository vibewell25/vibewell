import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { getPromotionCodes, createPromotionCode, deletePromotionCode, PromotionCode } from '../services/promotionService';
import { useTheme } from '../contexts/ThemeContext';

const PromotionsScreen: React.FC = () => {
  const { colors } = useTheme();
  const [codes, setCodes] = useState<PromotionCode[]>([]);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discount, setDiscount] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCodes = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      const data = await getPromotionCodes();
      setCodes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCodes(); }, []);

  const handleAdd = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    if (!code || !discount) { Alert.alert('Error', 'Code and discount required'); return; }
    setLoading(true);
    try {
      await createPromotionCode({ code, description, discount: Number(discount) });
      setCode(''); setDescription(''); setDiscount('');
      fetchCodes();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to create');
    }
  };

  const handleDelete = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');id: string) => {
    setLoading(true);
    try {
      await deletePromotionCode(id);
      fetchCodes();
    } catch (err) { console.error(err); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.form}>
        <TextInput
          placeholder="Code"
          value={code}
          onChangeText={setCode}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        />
        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        />
        <TextInput
          placeholder="Discount"
          value={discount}
          onChangeText={setDiscount}
          keyboardType="numeric"
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        />
        <Button title="Add" onPress={handleAdd} color={colors.primary} />
      </View>
      {loading ? <Text style={{ textAlign: 'center', marginTop: 20, color: colors.text }}>Loading...</Text> :
        <FlatList
          data={codes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={{ color: colors.text }}>{item.code} - {item.discount}%</Text>
              <Button title="Delete" onPress={() => handleDelete(item.id)} color={colors.notification} />
            </View>
          )}
        />
      }
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  form: { padding: 16 },
  input: { borderWidth: 1, marginBottom: 8, padding: 8, borderRadius: 4 },
  item: { padding: 16, borderBottomWidth: 1, borderColor: '#ccc', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});

export default PromotionsScreen;
