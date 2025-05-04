import React, { useEffect, useState } from 'react';
import { SafeAreaView, FlatList, ActivityIndicator, View, Text, Button, StyleSheet, TextInput } from 'react-native';
import { getTrainingModules, deleteTrainingModule, createTrainingModule } from '../services/trainingModuleService';
import { useTheme } from '../contexts/ThemeContext';

const TrainingModulesScreen: React.FC = () => {
  const { colors } = useTheme();
  const [modules, setModules] = useState([]);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [contentUrl, setContentUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    getTrainingModules()
      .then(data => setModules(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, []);

  const handleDelete = (id: string) => {
    deleteTrainingModule(id)
      .then(fetchData)
      .catch(console.error);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} size="large" />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.form}>
        <TextInput
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]} />
        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]} />
        <TextInput
          placeholder="Content URL"
          value={contentUrl}
          onChangeText={setContentUrl}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]} />
        <Button title="Add Module" onPress={async () => {
          setLoading(true);
          try {
            await createTrainingModule({ title, description, contentUrl });
            setTitle(''); setDescription(''); setContentUrl('');
            const data = await getTrainingModules(); setModules(data);
          } catch (err) { console.error(err); }
          setLoading(false);
        }} color={colors.primary} />
      </View>
      <FlatList
        data={modules}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={{ color: colors.text }}>{item.title}</Text>
            <Button title="Delete" onPress={() => handleDelete(item.id)} color={colors.notification} />
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  item: { padding: 16, borderBottomWidth: 1, borderColor: '#ccc' },
  form: { padding: 16 },
  input: { borderWidth: 1, marginBottom: 8, padding: 8, borderRadius: 4 },
});

export default TrainingModulesScreen;
