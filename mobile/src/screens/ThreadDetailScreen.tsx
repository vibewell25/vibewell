import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import communityApi from '../services/communityService';
import { Thread, ThreadPost } from '../types/community';
import { ThreadDetailRouteProp, ThreadDetailNavigationProp } from '../types/navigation';

const ThreadDetailScreen: React.FC = () => {
  const route = useRoute<ThreadDetailRouteProp>();
  const navigation = useNavigation<ThreadDetailNavigationProp>();
  const { id } = route.params;

  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<ThreadPost[]>([]);
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await communityApi.getThreadById(id);
      setThread(data);
      const comms = await communityApi.getThreadPosts(id);
      setPosts(comms);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load thread');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleAddPost = async () => {
    if (!newContent.trim()) return;
    try {
      await communityApi.addThreadPost(id, newContent.trim());
      setNewContent('');
      loadData();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to add post');
    }
  };

  const handleDeleteThread = async () => {
    try {
      await communityApi.deleteThread(id);
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to delete thread');
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{thread?.title}</Text>
      <View style={styles.buttonRow}>
        <Button title="Edit" onPress={() => navigation.navigate('ThreadForm', { thread })} />
        <Button title="Delete" onPress={handleDeleteThread} color="red" />
      </View>
      <Text style={styles.sectionTitle}>Posts</Text>
      <FlatList
        data={posts}
        keyExtractor={c => c.id}
        renderItem={({ item }) => (
          <View style={styles.post}>
            <Text>{item.content}</Text>
            <Text style={styles.postMeta}>{item.authorId} at {new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        )}
      />
      <TextInput
        style={styles.input}
        placeholder="Add a post"
        value={newContent}
        onChangeText={setNewContent}
      />
      <Button title="Post" onPress={handleAddPost} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  post: { marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderColor: '#ccc' },
  postMeta: { fontSize: 10, color: 'gray' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4, marginBottom: 12 }
});

export default ThreadDetailScreen;
