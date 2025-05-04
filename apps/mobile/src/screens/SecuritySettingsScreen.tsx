import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Platform,
  TextInput
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';

type RootStackParamList = {
  SecuritySettings: undefined;
  ChangePassword: undefined;
  TwoFactorSetup: undefined;
};

interface SecurityPreferences {
  biometricEnabled: boolean;
  twoFactorEnabled: boolean;
  passwordlessEnabled: boolean;
  autoLockEnabled: boolean;
  autoLockTimeout: number;
  securityNotifications: boolean;
  trustedDevices: boolean;
  passwordChangeReminder: boolean;
}

interface ActiveSession {
  id: string;
  deviceName: string;
  location: string;
  lastActive: string;
  isCurrentDevice: boolean;
}

const SecuritySettingsScreen: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [preferences, setPreferences] = useState<SecurityPreferences>({
    biometricEnabled: false,
    twoFactorEnabled: false,
    passwordlessEnabled: false,
    autoLockEnabled: true,
    autoLockTimeout: 5,
    securityNotifications: true,
    trustedDevices: true,
    passwordChangeReminder: true
  });
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [biometricSupported, setBiometricSupported] = useState(false);

  useEffect(() => {
    loadPreferences();
    checkBiometricSupport();
    loadActiveSessions();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const supported = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricSupported(supported && enrolled);
    } catch (error) {
      console.error('Error checking biometric support:', error);
    }
  };

  const loadPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem('@vibewell/security_preferences');
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading security preferences:', error);
      Alert.alert('Error', 'Failed to load security preferences');
    } finally {
      setLoading(false);
    }
  };

  const loadActiveSessions = async () => {
    // Mock data for demonstration
    const mockSessions: ActiveSession[] = [
      {
        id: '1',
        deviceName: 'iPhone 13 Pro',
        location: 'San Francisco, CA',
        lastActive: 'Now',
        isCurrentDevice: true
      },
      {
        id: '2',
        deviceName: 'MacBook Pro',
        location: 'San Francisco, CA',
        lastActive: '2 hours ago',
        isCurrentDevice: false
      },
      {
        id: '3',
        deviceName: 'iPad Air',
        location: 'New York, NY',
        lastActive: '1 day ago',
        isCurrentDevice: false
      }
    ];
    setActiveSessions(mockSessions);
  };

  const savePreferences = async (newPreferences: SecurityPreferences) => {
    try {
      await AsyncStorage.setItem(
        '@vibewell/security_preferences',
        JSON.stringify(newPreferences)
      );
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Error saving security preferences:', error);
      Alert.alert('Error', 'Failed to save security preferences');
    }
  };

  const handleToggle = async (key: keyof SecurityPreferences) => {
    if (key === 'biometricEnabled' && !preferences.biometricEnabled) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to enable biometric login'
        });
        if (!result.success) {
          return;
        }
      } catch (error) {
        console.error('Biometric authentication error:', error);
        return;
      }
    }

    const newPreferences = {
      ...preferences,
      [key]: key === 'autoLockTimeout' ? 
        (preferences[key] as number + 5) % 30 : 
        !preferences[key]
    };
    savePreferences(newPreferences);
  };

  const handleChangePassword = () => {
    // Navigate to change password screen
    navigation.navigate('ChangePassword');
  };

  const handleSetupTwoFactor = () => {
    // Navigate to 2FA setup screen
    navigation.navigate('TwoFactorSetup');
  };

  const handleRevokeSession = (sessionId: string) => {
    Alert.alert(
      'Revoke Session',
      'Are you sure you want to end this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: () => {
            setActiveSessions(prev => 
              prev.filter(session => session.id !== sessionId)
            );
          }
        }
      ]
    );
  };

  const renderSettingItem = (
    key: keyof SecurityPreferences,
    label: string,
    description?: string,
    disabled?: boolean
  ) => (
    <View style={[
      styles.settingItem,
      { borderBottomColor: isDarkMode ? '#333333' : '#E0E0E0' }
    ]}>
      <View style={styles.settingContent}>
        <Text style={[
          styles.settingLabel,
          { color: isDarkMode ? '#FFFFFF' : '#000000' },
          disabled && styles.disabledText
        ]}>
          {label}
        </Text>
        {description && (
          <Text style={[
            styles.settingDescription,
            { color: isDarkMode ? '#BBBBBB' : '#666666' },
            disabled && styles.disabledText
          ]}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={typeof preferences[key] === 'boolean' ? preferences[key] as boolean : false}
        onValueChange={() => handleToggle(key)}
        disabled={disabled || (key === 'biometricEnabled' && !biometricSupported)}
        trackColor={{ false: '#767577', true: '#4F46E5' }}
        thumbColor={preferences[key] ? '#FFFFFF' : '#F4F3F4'}
      />
    </View>
  );

  const renderActionButton = (
    label: string,
    onPress: () => void,
    type: 'primary' | 'destructive' = 'primary'
  ) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.actionButton,
        {
          backgroundColor: type === 'destructive' ? '#DC2626' : '#4F46E5',
          opacity: loading ? 0.5 : 1
        }
      ]}
      disabled={loading}
    >
      <Text style={styles.actionButtonText}>{label}</Text>
    </TouchableOpacity>
  );

  const renderSessionItem = (session: ActiveSession) => (
    <View
      key={session.id}
      style={[
        styles.sessionItem,
        { backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5' }
      ]}
    >
      <View style={styles.sessionInfo}>
        <View style={styles.sessionHeader}>
          <Text style={[
            styles.deviceName,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            {session.deviceName}
            {session.isCurrentDevice && (
              <Text style={styles.currentDevice}> (Current Device)</Text>
            )}
          </Text>
        </View>
        <Text style={[
          styles.sessionDetails,
          { color: isDarkMode ? '#BBBBBB' : '#666666' }
        ]}>
          {session.location} • {session.lastActive}
        </Text>
      </View>
      {!session.isCurrentDevice && (
        <TouchableOpacity
          onPress={() => handleRevokeSession(session.id)}
          style={styles.revokeButton}
        >
          <Text style={styles.revokeButtonText}>Revoke</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }
    ]}>
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
          Security Settings
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            Authentication
          </Text>
          {renderActionButton('Change Password', handleChangePassword)}
          {renderSettingItem(
            'biometricEnabled',
            'Biometric Login',
            `Use ${Platform.OS === 'ios' ? 'Face ID/Touch ID' : 'fingerprint'} to log in`,
            !biometricSupported
          )}
          {renderSettingItem(
            'twoFactorEnabled',
            'Two-Factor Authentication',
            'Add an extra layer of security to your account'
          )}
          {preferences.twoFactorEnabled && renderActionButton('Setup 2FA', handleSetupTwoFactor)}
        </View>

        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            Security Options
          </Text>
          {renderSettingItem(
            'passwordlessEnabled',
            'Passwordless Login',
            'Use magic links to sign in without a password'
          )}
          {renderSettingItem(
            'autoLockEnabled',
            'Auto-Lock',
            'Automatically lock the app after inactivity'
          )}
          {renderSettingItem(
            'securityNotifications',
            'Security Notifications',
            'Get notified about important security events'
          )}
          {renderSettingItem(
            'trustedDevices',
            'Remember Trusted Devices',
            'Skip 2FA on devices you trust'
          )}
          {renderSettingItem(
            'passwordChangeReminder',
            'Password Change Reminder',
            'Get reminded to change your password periodically'
          )}
        </View>

        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            Active Sessions
          </Text>
          {activeSessions.map(renderSessionItem)}
        </View>
      </ScrollView>
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
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  disabledText: {
    opacity: 0.5,
  },
  actionButton: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
  },
  currentDevice: {
    color: '#4F46E5',
    fontSize: 14,
  },
  sessionDetails: {
    fontSize: 14,
  },
  revokeButton: {
    marginLeft: 16,
  },
  revokeButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SecuritySettingsScreen; 