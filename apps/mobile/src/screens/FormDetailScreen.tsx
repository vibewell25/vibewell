import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, Alert, ScrollView, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FormDetailRouteProp, FormListNavigationProp } from '../types/navigation';
import { FormDefinition } from '../types/forms';
import { formsApi } from '../services/formsService';

const FormDetailScreen: React.FC = () => {
  const navigation = useNavigation<FormListNavigationProp>();
  const route = useRoute<FormDetailRouteProp>();
  const { formId } = route.params;

  const [formDef, setFormDef] = useState<FormDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [attachments, setAttachments] = useState<{url: string, type: string}[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const def = await formsApi.getFormById(formId);
        setFormDef(def);
        const initData: Record<string, any> = {};
        def.fields.forEach(f => { initData[f.name] = ''; });
        setFormData(initData);
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to load form');
      } finally {
        setLoading(false);
      }
    })();
  }, [formId]);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePick = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (result.type === 'success') {
      const file = { uri: result.uri, name: result.name, type: result.mimeType || 'application/octet-stream' };
      try {
        const { url } = await formsApi.uploadDocument(file);
        setAttachments(prev => [...prev, { url, type: result.name }]);
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to upload document');
      }
    }
  };

  const handleSubmit = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    setSubmitting(true);
    try {
      await formsApi.submitForm(formId, formData, attachments);
      Alert.alert('Success', 'Form submitted');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{formDef.name}</Text>
      {formDef.fields.map(field => (
        <View key={field.name} style={styles.field}>
          <Text style={styles.label}>{field.label}</Text>
          <TextInput
            style={styles.input}
            value={String(formData[field.name])}
            onChangeText={text => handleChange(field.name, text)}
            keyboardType={field.type === 'number' ? 'numeric' : 'default'}
            placeholder={field.label}
          />
        </View>
      ))}
      <Button title="Attach File" onPress={handlePick} />
      {attachments.map((att, idx) => (
        <Text key={idx} style={styles.attachment}>{att.type}</Text>
      ))}
      <Button
        title={submitting ? 'Submitting...' : 'Submit'}
        onPress={handleSubmit}
        disabled={submitting}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  field: { marginBottom: 12 },
  label: { marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 },
  attachment: { marginVertical: 4, color: '#555' }
});

export default FormDetailScreen;
