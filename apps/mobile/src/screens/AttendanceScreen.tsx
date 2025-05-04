import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, ActivityIndicator, Button, StyleSheet, TextInput } from 'react-native';
import { getAttendance, getAttendanceBySchedule, createAttendance, deleteAttendance, AttendanceRecord } from '../services/attendanceService';
import { useTheme } from '../contexts/ThemeContext';

const AttendanceScreen: React.FC = () => {
  const { colors } = useTheme();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [scheduleId, setScheduleId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchRecords = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    setLoading(true);
    try {
      const data = scheduleId.trim()
        ? await getAttendanceBySchedule(scheduleId)
        : await getAttendance();
      setRecords(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchRecords(); }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} size="large" />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.form}>
        <TextInput
          placeholder="Schedule ID"
          value={scheduleId}
          onChangeText={setScheduleId}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]} />
        <Button title="Fetch Records" onPress={fetchRecords} />
        <Button title="Clock In" onPress={async () => {
          setLoading(true);
          try {
            await createAttendance(scheduleId, 'clock-in');
            await fetchRecords();
          } catch (err) { console.error(err); }
          setLoading(false);
        }} color={colors.primary} />
        <Button title="Clock Out" onPress={async () => {
          setLoading(true);
          try {
            await createAttendance(scheduleId, 'clock-out');
            await fetchRecords();
          } catch (err) { console.error(err); }
          setLoading(false);
        }} color={colors.notification} />
      </View>
      <FlatList
        data={records}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={{ color: colors.text }}>{new Date(item.timestamp).toLocaleString()} - {item.status}</Text>
            <Button title="Delete" color={colors.notification} onPress={async () => {
              setLoading(true);
              try {
                await deleteAttendance(item.id);
                await fetchRecords();
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

export default AttendanceScreen;
