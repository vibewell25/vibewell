import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Button, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import communityApi from '../services/communityService';
import { Post, Comment } from '@/types/community';
import { PostDetailRouteProp, PostDetailNavigationProp } from '@/types/navigation';

const PostDetailScreen: React.FC = () => {
  const route = useRoute<PostDetailRouteProp>();
  const navigation = useNavigation<PostDetailNavigationProp>();
  const { id } = route.params;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await communityApi.getPostById(id);
      setPost(data);
      const comms = await communityApi.getComments(id);
      setComments(comms);
catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load post');
finally {
      setLoading(false);
useEffect(() => { loadData(); }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await communityApi.addComment(id, newComment.trim());
      setNewComment('');
      loadData();
catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to add comment');
const handleDelete = async () => {
    try {
      await communityApi.deletePost(id);
      navigation.goBack();
catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to delete post');
if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{post.content}</Text>
      <Text style={styles.meta}>By {post.authorId} on {new Date(post.createdAt).toLocaleString()}</Text>
      <View style={styles.buttonRow}>
        <Button title="Edit" onPress={() => navigation.navigate('PostForm', { post: post! })} />
        <Button title="Delete" onPress={handleDelete} color="red" />
      </View>
      <Text style={styles.sectionTitle}>Comments</Text>
      <FlatList
        data={comments}
        keyExtractor={c => c.id}
        renderItem={({ item }) => (
          <View style={styles.comment}>
            <Text>{item.content}</Text>
            <Text style={styles.commentMeta}>{item.authorId} at {new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        )}
      />
      <TextInput
        style={styles.input}
        placeholder="Add a comment"
        value={newComment}
        onChangeText={setNewComment}
      />
      <Button title="Post Comment" onPress={handleAddComment} />
    </View>
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  meta: { fontSize: 12, color: 'gray', marginBottom: 16 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  comment: { marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderColor: '#ccc' },
  commentMeta: { fontSize: 10, color: 'gray' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4, marginBottom: 12 }
export default PostDetailScreen;
