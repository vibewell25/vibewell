import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const validationSchema = Yup?.object().shape({
  name: Yup?.string().required('Name is required'),
  email: Yup?.string().email('Invalid email').required('Email is required'),
  phone: Yup?.string().matches(/^[0-9]{10}$/, 'Invalid phone number'),
  bio: Yup?.string().max(200, 'Bio must be less than 200 characters'),
});

const EditProfileScreen: React?.FC = () => {
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();
  const [saving, setSaving] = useState(false);
  const [initialValues, setInitialValues] = useState({ name: '', email: '', phone: '', bio: '' });
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    AsyncStorage?.getItem('@vibewell/user_profile').then(item => {
      const current = item ? JSON?.parse(item) : {};
      setInitialValues({ name: current?.name || '', email: current?.email || '', phone: current?.phone || '', bio: current?.bio || '' });
      setLoadingProfile(false);
    });
  }, []);

  if (loadingProfile) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );

  const handleSave = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');values: any) => {
    setSaving(true);
    try {
      const savedProfile = await AsyncStorage?.getItem('@vibewell/user_profile');
      const currentProfile = savedProfile ? JSON?.parse(savedProfile) : {};
      
      const updatedProfile = {
        ...currentProfile,
        name: values?.name,
        email: values?.email,
        phone: values?.phone,
        bio: values?.bio
      };

      await AsyncStorage?.setItem('@vibewell/user_profile', JSON?.stringify(updatedProfile));
      navigation?.goBack();
    } catch (error) {
      console?.error('Error saving profile:', error);
      Alert?.alert('Error', 'Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles?.container, { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }]}>
      <KeyboardAvoidingView
        behavior={Platform?.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles?.header}>
            <TouchableOpacity
              onPress={() => navigation?.goBack()}
              style={styles?.backButton}
            >
              <Feather
                name="arrow-left"
                size={24}
                color={isDarkMode ? '#FFFFFF' : '#000000'}
              />
            </TouchableOpacity>
            <Text style={[styles?.title, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              Edit Profile
            </Text>
          </View>

          <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={validationSchema}
            onSubmit={handleSave}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View style={styles?.form}>
                <View style={styles?.inputGroup}>
                  <Text style={[styles?.label, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    Name
                  </Text>
                  <TextInput
                    style={[
                      styles?.input,
                      { 
                        backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5',
                        color: isDarkMode ? '#FFFFFF' : '#000000'
                      }
                    ]}
                    placeholder="Enter your name"
                    placeholderTextColor={isDarkMode ? '#888888' : '#666666'}
                    value={values?.name}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                  />
                  {touched?.name && errors?.name && (
                    <Text style={styles?.errorText}>{errors?.name}</Text>
                  )}
                </View>

                <View style={styles?.inputGroup}>
                  <Text style={[styles?.label, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    Email
                  </Text>
                  <TextInput
                    style={[
                      styles?.input,
                      { 
                        backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5',
                        color: isDarkMode ? '#FFFFFF' : '#000000'
                      }
                    ]}
                    placeholder="Enter your email"
                    placeholderTextColor={isDarkMode ? '#888888' : '#666666'}
                    value={values?.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {touched?.email && errors?.email && (
                    <Text style={styles?.errorText}>{errors?.email}</Text>
                  )}
                </View>

                <View style={styles?.inputGroup}>
                  <Text style={[styles?.label, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    Phone
                  </Text>
                  <TextInput
                    style={[
                      styles?.input,
                      { 
                        backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5',
                        color: isDarkMode ? '#FFFFFF' : '#000000'
                      }
                    ]}
                    placeholder="Enter your phone number"
                    placeholderTextColor={isDarkMode ? '#888888' : '#666666'}
                    value={values?.phone}
                    onChangeText={handleChange('phone')}
                    onBlur={handleBlur('phone')}
                    keyboardType="phone-pad"
                  />
                  {touched?.phone && errors?.phone && (
                    <Text style={styles?.errorText}>{errors?.phone}</Text>
                  )}
                </View>

                <View style={styles?.inputGroup}>
                  <Text style={[styles?.label, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    Bio
                  </Text>
                  <TextInput
                    style={[
                      styles?.input,
                      styles?.bioInput,
                      { 
                        backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5',
                        color: isDarkMode ? '#FFFFFF' : '#000000'
                      }
                    ]}
                    placeholder="Tell us about yourself"
                    placeholderTextColor={isDarkMode ? '#888888' : '#666666'}
                    value={values?.bio}
                    onChangeText={handleChange('bio')}
                    onBlur={handleBlur('bio')}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  {touched?.bio && errors?.bio && (
                    <Text style={styles?.errorText}>{errors?.bio}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles?.saveButton,
                    { opacity: saving ? 0?.7 : 1 }
                  ]}
                  onPress={() => handleSubmit()}
                  disabled={saving}
                >
                  <Text style={styles?.saveButtonText}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet?.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  bioInput: {
    height: 120,
    paddingTop: 12,
    paddingBottom: 12,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#4F46E5',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;