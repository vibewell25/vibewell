import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, FlatList, ActivityIndicator, StyleSheet, TextInput, Button } from 'react-native';
import { getSchedules, StaffSchedule, createSchedule, deleteSchedule } from '../services/staffScheduleService';
import { useTheme } from '../contexts/ThemeContext';

const StaffScheduleScreen: React.FC = () => {
  const { colors } = useTheme();
  const [schedules, setSchedules] = useState<StaffSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffId, setStaffId] = useState<string>('');
  const [dateInput, setDateInput] = useState<string>('');
  const [startInput, setStartInput] = useState<string>('');
  const [endInput, setEndInput] = useState<string>('');

  useEffect(() => {
    getSchedules()
      .then(data => setSchedules(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} size="large" />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.form}>
        <TextInput
          placeholder="Staff ID"
          value={staffId}
          onChangeText={setStaffId}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        />
        <TextInput
          placeholder="Date (YYYY-MM-DD)"
          value={dateInput}
          onChangeText={setDateInput}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        />
        <TextInput
          placeholder="Start Time (HH:MM)"
          value={startInput}
          onChangeText={setStartInput}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        />
        <TextInput
          placeholder="End Time (HH:MM)"
          value={endInput}
          onChangeText={setEndInput}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        />
        <Button
          title="Add Schedule"
          onPress={async () => {
            setLoading(true);
            try {
              await createSchedule({ staffId, date: dateInput, startTime: `${dateInput}T${startInput}`, endTime: `${dateInput}T${endInput}` });
              const data = await getSchedules();
              setSchedules(data);
              setStaffId(''); setDateInput(''); setStartInput(''); setEndInput('');
            } catch (err) {
              console.error(err);
            }
            setLoading(false);
          }}
          color={colors.primary}
        />
      </View>
      <FlatList
        data={schedules}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={{ color: colors.text }}>{new Date(item.date).toLocaleDateString()} {new Date(item.startTime).toLocaleTimeString()} - {new Date(item.endTime).toLocaleTimeString()}</Text>
            <Button title="Delete" color={colors.notification} onPress={async () => {
              setLoading(true);
              try {
                await deleteSchedule(item.id);
                const data = await getSchedules();
                setSchedules(data);
              } catch (err) { console.error(err); }
              setLoading(false);
            }} />
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

export default StaffScheduleScreen;
