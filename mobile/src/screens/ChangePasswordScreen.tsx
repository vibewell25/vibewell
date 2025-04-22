import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import { Formik } from 'formik';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const validationSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .notOneOf(
      [Yup.ref('currentPassword')],
      'New password must be different from current password'
    )
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Password confirmation is required'),
});

const ChangePasswordScreen: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (values: PasswordForm) => {
    setLoading(true);
    try {
      // TODO: Implement actual password change logic with your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      Alert.alert(
        'Success',
        'Your password has been changed successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to change password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordInput = (
    field: keyof PasswordForm,
    label: string,
    placeholder: string,
    showPassword: boolean,
    setShowPassword: (show: boolean) => void,
    formikProps: any
  ) => (
    <View style={styles.inputGroup}>
      <Text style={[
        styles.label,
        { color: isDarkMode ? '#FFFFFF' : '#000000' }
      ]}>
        {label}
      </Text>
      <View style={[
        styles.inputContainer,
        { backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5' }
      ]}>
        <TextInput
          style={[
            styles.input,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}
          placeholder={placeholder}
          placeholderTextColor={isDarkMode ? '#888888' : '#666666'}
          secureTextEntry={!showPassword}
          value={formikProps.values[field]}
          onChangeText={formikProps.handleChange(field)}
          onBlur={formikProps.handleBlur(field)}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.visibilityToggle}
        >
          <Feather
            name={showPassword ? 'eye-off' : 'eye'}
            size={24}
            color={isDarkMode ? '#FFFFFF' : '#000000'}
          />
        </TouchableOpacity>
      </View>
      {formikProps.touched[field] && formikProps.errors[field] && (
        <Text style={styles.errorText}>
          {formikProps.errors[field]}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }
    ]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Feather
              name="arrow-left"
              size={24}
              color={isDarkMode ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity>
          <Text style={[
            styles.title,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            Change Password
          </Text>
        </View>

        <ScrollView style={styles.content}>
          <Text style={[
            styles.description,
            { color: isDarkMode ? '#BBBBBB' : '#666666' }
          ]}>
            Choose a strong password that you haven't used before.
          </Text>

          <Formik
            initialValues={{
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            }}
            validationSchema={validationSchema}
            onSubmit={handleChangePassword}
          >
            {(formikProps) => (
              <View style={styles.form}>
                {renderPasswordInput(
                  'currentPassword',
                  'Current Password',
                  'Enter your current password',
                  showCurrentPassword,
                  setShowCurrentPassword,
                  formikProps
                )}

                {renderPasswordInput(
                  'newPassword',
                  'New Password',
                  'Enter your new password',
                  showNewPassword,
                  setShowNewPassword,
                  formikProps
                )}

                {renderPasswordInput(
                  'confirmPassword',
                  'Confirm New Password',
                  'Confirm your new password',
                  showConfirmPassword,
                  setShowConfirmPassword,
                  formikProps
                )}

                <TouchableOpacity
                  style={[
                    styles.changeButton,
                    { opacity: loading ? 0.7 : 1 }
                  ]}
                  onPress={() => formikProps.handleSubmit()}
                  disabled={loading}
                >
                  <Text style={styles.changeButtonText}>
                    {loading ? 'Changing Password...' : 'Change Password'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>

          <View style={styles.requirements}>
            <Text style={[
              styles.requirementsTitle,
              { color: isDarkMode ? '#FFFFFF' : '#000000' }
            ]}>
              Password Requirements:
            </Text>
            <Text style={[
              styles.requirementItem,
              { color: isDarkMode ? '#BBBBBB' : '#666666' }
            ]}>
              • At least 8 characters long
            </Text>
            <Text style={[
              styles.requirementItem,
              { color: isDarkMode ? '#BBBBBB' : '#666666' }
            ]}>
              • Contains at least one uppercase letter
            </Text>
            <Text style={[
              styles.requirementItem,
              { color: isDarkMode ? '#BBBBBB' : '#666666' }
            ]}>
              • Contains at least one lowercase letter
            </Text>
            <Text style={[
              styles.requirementItem,
              { color: isDarkMode ? '#BBBBBB' : '#666666' }
            ]}>
              • Contains at least one number
            </Text>
            <Text style={[
              styles.requirementItem,
              { color: isDarkMode ? '#BBBBBB' : '#666666' }
            ]}>
              • Contains at least one special character
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  content: {
    flex: 1,
    padding: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    height: 48,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 16,
  },
  visibilityToggle: {
    padding: 12,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    marginTop: 4,
  },
  changeButton: {
    backgroundColor: '#4F46E5',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  changeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  requirements: {
    padding: 16,
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  requirementItem: {
    fontSize: 14,
    marginBottom: 8,
  },
});

export default ChangePasswordScreen; 