import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import communityApi from '../services/communityService';
import { Post } from '../types/community';
import { PostFormRouteProp, PostFormNavigationProp } from '../types/navigation';

const PostFormScreen: React.FC = () => {
  const route = useRoute<PostFormRouteProp>();
  const navigation = useNavigation<PostFormNavigationProp>();
  const { post } = route.params || {};

  const [content, setContent] = useState(post?.content || '');

  const handleSubmit = async () => {
    try {
      if (post) {
        await communityApi.updatePost(post.id, { content });
      } else {
        await communityApi.createPost(content);
      }
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save post');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="What's on your mind?"
        value={content}
        onChangeText={setContent}
        multiline
      />
      <Button title={post ? 'Update' : 'Create'} onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4, marginBottom: 12, height: 100 }
});

export default PostFormScreen;
