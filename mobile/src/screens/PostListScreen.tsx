import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { communityApi } from '../services/communityService';
import { Post } from '../types/community';
import { PostListNavigationProp } from '../types/navigation';

const PostListScreen: React.FC = () => {
  const navigation = useNavigation<PostListNavigationProp>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await communityApi.getPosts();
        setPosts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Button title="New Post" onPress={() => navigation.navigate('PostForm', {})} />
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('PostDetail', { id: item.id })}
          >
            <Text style={styles.title}>{item.content}</Text>
            <Text style={styles.subtitle}>{item.authorId} - {new Date(item.createdAt).toLocaleDateString()}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: { marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderColor: '#ccc' },
  title: { fontSize: 16, fontWeight: 'bold' },
  subtitle: { fontSize: 12, color: 'gray' }
});

export default PostListScreen;
