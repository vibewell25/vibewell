import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types/navigation';
import { AR_MODELS } from '../ar/modelConfig';

// Navigation prop for model selection
type ModelSelectionNavigationProp = StackNavigationProp<RootStackParamList, 'ModelSelection'>;

const ModelSelectionScreen: React.FC = () => {
  const navigation = useNavigation<ModelSelectionNavigationProp>();

  const renderItem = ({ item }: { item: typeof AR_MODELS[0] }) => (
    <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('TryOn', { source: item.source, scale: item.scale })}>
      <Text style={styles.label}>{item.label}</Text>
    </TouchableOpacity>
return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose your look:</Text>
      <FlatList
        data={AR_MODELS}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        numColumns={2}
        contentContainerStyle={styles.list}
      />
    </View>
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  list: { alignItems: 'center' },
  item: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 16,
    margin: 8,
    width: '40%',
    alignItems: 'center',
label: { fontSize: 16 },
export default ModelSelectionScreen;
