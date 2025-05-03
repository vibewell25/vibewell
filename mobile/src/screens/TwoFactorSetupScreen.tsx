import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Image,
  Clipboard,
  Share
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import { Formik } from 'formik';
import TwoFactorService from '../services/auth/twoFactorService';

interface TwoFactorForm {
  verificationCode: string;
}

const validationSchema = Yup?.object().shape({
  verificationCode: Yup?.string()
    .matches(/^\d{6}$/, 'Code must be exactly 6 digits')
    .required('Verification code is required'),
});

const TwoFactorSetupScreen: React?.FC = () => {
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'qr' | 'verify' | 'backup'>('qr');
  const [secretKey, setSecretKey] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const twoFactorService = TwoFactorService?.getInstance();

  useEffect(() => {
    generateSecretKey();
  }, []);

  const generateSecretKey = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      setLoading(true);
      const response = await twoFactorService?.generateSecretKey();
      
      if (response?.success && response?.data) {
        setSecretKey(response?.data.secretKey);
        setQrCodeUrl(response?.data.qrCodeUrl);
      } else {
        Alert?.alert('Error', response?.message || 'Failed to generate 2FA secret key');
      }
    } catch (error) {
      Alert?.alert('Error', 'Failed to generate 2FA secret key');
    } finally {
      setLoading(false);
    }
  };

  const generateBackupCodes = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      const response = await twoFactorService?.generateBackupCodes();
      
      if (response?.success && response?.data) {
        setBackupCodes(response?.data.backupCodes);
      } else {
        Alert?.alert('Error', response?.message || 'Failed to generate backup codes');
      }
    } catch (error) {
      Alert?.alert('Error', 'Failed to generate backup codes');
    }
  };

  const handleCopySecretKey = () => {
    Clipboard?.setString(secretKey?.replace(/\s/g, ''));
    Alert?.alert('Copied', 'Secret key copied to clipboard');
  };

  const handleShareBackupCodes = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      const message = 'Your 2FA Backup Codes:\n\n' + 
        backupCodes?.join('\n') + 
        '\n\nKeep these codes safe and secure. You\'ll need them if you lose access to your authenticator app.';
      
      await Share?.share({
        message,
        title: 'Vibewell 2FA Backup Codes'
      });
    } catch (error) {
      Alert?.alert('Error', 'Failed to share backup codes');
    }
  };

  const handleVerifyCode = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');values: TwoFactorForm) => {
    setLoading(true);
    try {
      const verifyResponse = await twoFactorService?.verifyCode(values?.verificationCode);
      
      if (verifyResponse?.success) {
        await generateBackupCodes();
        setStep('backup');
      } else {
        Alert?.alert('Error', verifyResponse?.message || 'Invalid verification code');
      }
    } catch (error) {
      Alert?.alert('Error', 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
    setLoading(true);
    try {
      const response = await twoFactorService?.enable2FA();
      
      if (response?.success) {
        Alert?.alert(
          'Setup Complete',
          'Two-factor authentication has been enabled for your account.',
          [{ text: 'OK', onPress: () => navigation?.goBack() }]
        );
      } else {
        Alert?.alert('Error', response?.message || 'Failed to enable 2FA');
      }
    } catch (error) {
      Alert?.alert('Error', 'Failed to enable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const renderQRStep = () => (
    <View style={styles?.stepContainer}>
      <Text style={[styles?.description, { color: isDarkMode ? '#BBBBBB' : '#666666' }]}>
        Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.).
      </Text>

      <View style={[styles?.qrContainer, { backgroundColor: '#FFFFFF' }]}>
        <Image
          source={{ uri: qrCodeUrl }}
          style={styles?.qrCode}
          resizeMode="contain"
        />
      </View>

      <Text style={[styles?.orText, { color: isDarkMode ? '#BBBBBB' : '#666666' }]}>
        Or enter this code manually:
      </Text>

      <View style={styles?.secretKeyContainer}>
        <Text style={[styles?.secretKey, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
          {secretKey}
        </Text>
        <TouchableOpacity onPress={handleCopySecretKey}>
          <Feather name="copy" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles?.button}
        onPress={() => setStep('verify')}
      >
        <Text style={styles?.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  const renderVerifyStep = () => (
    <View style={styles?.stepContainer}>
      <Text style={[styles?.description, { color: isDarkMode ? '#BBBBBB' : '#666666' }]}>
        Enter the 6-digit code from your authenticator app to verify the setup.
      </Text>

      <Formik
        initialValues={{ verificationCode: '' }}
        validationSchema={validationSchema}
        onSubmit={handleVerifyCode}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View>
            <View style={styles?.codeInputContainer}>
              <TextInput
                style={[
                  styles?.codeInput,
                  { color: isDarkMode ? '#FFFFFF' : '#000000' }
                ]}
                placeholder="Enter 6-digit code"
                placeholderTextColor={isDarkMode ? '#888888' : '#666666'}
                value={values?.verificationCode}
                onChangeText={handleChange('verificationCode')}
                onBlur={handleBlur('verificationCode')}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
            </View>

            {touched?.verificationCode && errors?.verificationCode && (
              <Text style={styles?.errorText}>{errors?.verificationCode}</Text>
            )}

            <TouchableOpacity
              style={[styles?.button, { opacity: loading ? 0?.7 : 1 }]}
              onPress={() => handleSubmit()}
              disabled={loading}
            >
              <Text style={styles?.buttonText}>
                {loading ? 'Verifying...' : 'Verify'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </View>
  );

  const renderBackupStep = () => (
    <View style={styles?.stepContainer}>
      <Text style={[styles?.description, { color: isDarkMode ? '#BBBBBB' : '#666666' }]}>
        Save these backup codes in a secure place. You can use them to access your account if you lose your authenticator device.
      </Text>

      <View style={styles?.backupCodesContainer}>
        {backupCodes?.map((code, index) => (
          <Text
            key={index}
            style={[styles?.backupCode, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}
          >
            {code}
          </Text>
        ))}
      </View>

      <TouchableOpacity
        style={styles?.shareButton}
        onPress={handleShareBackupCodes}
      >
        <Feather name="share-2" size={20} color="#4F46E5" />
        <Text style={styles?.shareButtonText}>Share Backup Codes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles?.button}
        onPress={handleFinish}
      >
        <Text style={styles?.buttonText}>Finish Setup</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[
      styles?.container,
      { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }
    ]}>
      {loading && step === 'qr' && (
        <View style={styles?.loadingContainer}>
          <Text style={[styles?.loadingText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            Generating 2FA Secret Key...
          </Text>
        </View>
      )}
      
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
        <Text style={[
          styles?.title,
          { color: isDarkMode ? '#FFFFFF' : '#000000' }
        ]}>
          Set Up Two-Factor Auth
        </Text>
      </View>

      <ScrollView style={styles?.content}>
        <View style={styles?.stepsIndicator}>
          <View style={[
            styles?.stepDot,
            { backgroundColor: step === 'qr' ? '#4F46E5' : '#4F46E5' }
          ]} />
          <View style={[
            styles?.stepLine,
            { backgroundColor: step !== 'qr' ? '#4F46E5' : '#666666' }
          ]} />
          <View style={[
            styles?.stepDot,
            { backgroundColor: step === 'verify' ? '#4F46E5' : step === 'backup' ? '#4F46E5' : '#666666' }
          ]} />
          <View style={[
            styles?.stepLine,
            { backgroundColor: step === 'backup' ? '#4F46E5' : '#666666' }
          ]} />
          <View style={[
            styles?.stepDot,
            { backgroundColor: step === 'backup' ? '#4F46E5' : '#666666' }
          ]} />
        </View>

        {step === 'qr' && renderQRStep()}
        {step === 'verify' && renderVerifyStep()}
        {step === 'backup' && renderBackupStep()}
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 16,
  },
  stepsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
  },
  stepContainer: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  qrContainer: {
    alignSelf: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  qrCode: {
    width: 200,
    height: 200,
  },
  orText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  secretKeyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  secretKey: {
    fontSize: 20,
    fontFamily: Platform?.OS === 'ios' ? 'Courier' : 'monospace',
    marginRight: 12,
  },
  button: {
    backgroundColor: '#4F46E5',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  codeInputContainer: {
    marginBottom: 16,
  },
  codeInput: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    fontSize: 20,
    textAlign: 'center',
    fontFamily: Platform?.OS === 'ios' ? 'Courier' : 'monospace',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  backupCodesContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  backupCode: {
    fontSize: 18,
    fontFamily: Platform?.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'center',
    marginBottom: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  shareButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0?.5)',
    zIndex: 999,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default TwoFactorSetupScreen; 