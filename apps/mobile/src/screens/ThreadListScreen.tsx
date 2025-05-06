import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import communityApi from '../services/communityService';
import { Thread } from '@/types/community';
import { ThreadListNavigationProp } from '@/types/navigation';

const ThreadListScreen: React.FC = () => {
  const navigation = useNavigation<ThreadListNavigationProp>();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await communityApi.getThreads();
        setThreads(data);
catch (err) {
        console.error(err);
finally {
        setLoading(false);
)();
[]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Button title="New Thread" onPress={() => navigation.navigate('ThreadForm', {})} />
      <FlatList
        data={threads}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('ThreadDetail', { id: item.id })}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.authorId} - {new Date(item.createdAt).toLocaleDateString()}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: { marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderColor: '#ccc' },
  title: { fontSize: 16, fontWeight: 'bold' },
  subtitle: { fontSize: 12, color: 'gray' },
export default ThreadListScreen;
