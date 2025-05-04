import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import communityApi from '../services/communityService';
import { Thread } from '../types/community';
import { ThreadFormRouteProp, ThreadFormNavigationProp } from '../types/navigation';

const ThreadFormScreen: React.FC = () => {
  const route = useRoute<ThreadFormRouteProp>();
  const navigation = useNavigation<ThreadFormNavigationProp>();
  const { thread } = route.params || {};
  const [title, setTitle] = useState(thread.title || '');

  const handleSubmit = async () => {
    try {
      if (thread) {
        await communityApi.updateThread(thread.id, { title });
      } else {
        await communityApi.createThread(title);
      }
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save thread');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Thread title"
        value={title}
        onChangeText={setTitle}
      />
      <Button title={thread ? 'Update' : 'Create'} onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4, marginBottom: 12 }
});

export default ThreadFormScreen;
