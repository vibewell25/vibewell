import React, { useEffect, useState } from 'react';
import { SafeAreaView, FlatList, ActivityIndicator, View, Text, StyleSheet, TextInput, Button } from 'react-native';
import { getTrainingProgress, TrainingProgress, markTrainingProgress, deleteTrainingProgress } from '../services/trainingProgressService';
import { useTheme } from '../contexts/ThemeContext';

const TrainingProgressScreen: React?.FC = () => {
  const { colors } = useTheme();
  const [progress, setProgress] = useState<TrainingProgress[]>([]);
  const [moduleId, setModuleId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrainingProgress()
      .then(data => setProgress(data))
      .catch(console?.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors?.primary} size="large" />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors?.background }}>
      <View style={styles?.form}>
        <TextInput
          placeholder="Module ID"
          value={moduleId}
          onChangeText={setModuleId}
          style={[styles?.input, { color: colors?.text, borderColor: colors?.border }]} />
        <Button
          title="Mark Complete"
          onPress={async () => {
            setLoading(true);
            try {
              await markTrainingProgress(moduleId);
              const data = await getTrainingProgress();
              setProgress(data);
              setModuleId('');
            } catch (err) {
              console?.error(err);
            }
            setLoading(false);
          }}
          color={colors?.primary}
        />
      </View>
      <FlatList
        data={progress}
        keyExtractor={item => item?.id}
        renderItem={({ item }) => (
          <View style={styles?.item}>
            <Text style={{ color: colors?.text }}>Module {item?.moduleId} completed at {new Date(item?.completedAt).toLocaleString()}</Text>
            <Button title="Delete" color={colors?.notification} onPress={async () => {
              setLoading(true);
              try {
                await deleteTrainingProgress(item?.id);
                const data = await getTrainingProgress();
                setProgress(data);
              } catch (err) { console?.error(err); }
              setLoading(false);
            }} />
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet?.create({
  item: { padding: 16, borderBottomWidth: 1, borderColor: '#ccc' },
  form: { padding: 16 },
  input: { borderWidth: 1, marginBottom: 8, padding: 8, borderRadius: 4 },
});

export default TrainingProgressScreen;
