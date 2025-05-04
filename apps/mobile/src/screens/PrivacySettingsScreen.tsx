import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Linking
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PrivacyPreferences {
  locationTracking: boolean;
  activityTracking: boolean;
  dataSharing: boolean;
  analytics: boolean;
  personalization: boolean;
  marketing: boolean;
  thirdPartyIntegrations: boolean;
  biometricAuth: boolean;
}

const PrivacySettingsScreen: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();
  const [preferences, setPreferences] = useState<PrivacyPreferences>({
    locationTracking: false,
    activityTracking: true,
    dataSharing: false,
    analytics: true,
    personalization: true,
    marketing: false,
    thirdPartyIntegrations: false,
    biometricAuth: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem('@vibewell/privacy_preferences');
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading privacy preferences:', error);
      Alert.alert('Error', 'Failed to load privacy preferences');
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPreferences: PrivacyPreferences) => {
    try {
      await AsyncStorage.setItem(
        '@vibewell/privacy_preferences',
        JSON.stringify(newPreferences)
      );
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Error saving privacy preferences:', error);
      Alert.alert('Error', 'Failed to save privacy preferences');
    }
  };

  const handleToggle = (key: keyof PrivacyPreferences) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key]
    };

    // If data sharing is disabled, disable related features
    if (key === 'dataSharing' && !newPreferences.dataSharing) {
      newPreferences.analytics = false;
      newPreferences.personalization = false;
      newPreferences.marketing = false;
      newPreferences.thirdPartyIntegrations = false;
    }

    savePreferences(newPreferences);
  };

  const handleViewPrivacyPolicy = () => {
    Linking.openURL('https://vibewell.com/privacy-policy');
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete All Data',
      'Are you sure you want to delete all your data? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement data deletion
            Alert.alert('Success', 'Your data has been deleted');
          }
        }
      ]
    );
  };

  const renderSettingItem = (
    key: keyof PrivacyPreferences,
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
        value={preferences[key]}
        onValueChange={() => handleToggle(key)}
        disabled={disabled}
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
          Privacy Settings
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            Data Collection
          </Text>
          {renderSettingItem(
            'locationTracking',
            'Location Tracking',
            'Allow app to access your location'
          )}
          {renderSettingItem(
            'activityTracking',
            'Activity Tracking',
            'Track app usage and interactions'
          )}
          {renderSettingItem(
            'biometricAuth',
            'Biometric Authentication',
            'Use Face ID or Touch ID for login'
          )}
        </View>

        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            Data Usage
          </Text>
          {renderSettingItem(
            'dataSharing',
            'Data Sharing',
            'Share data to improve services'
          )}
          {renderSettingItem(
            'analytics',
            'Analytics',
            'Help us improve with usage data',
            !preferences.dataSharing
          )}
          {renderSettingItem(
            'personalization',
            'Personalization',
            'Customize your experience',
            !preferences.dataSharing
          )}
          {renderSettingItem(
            'marketing',
            'Marketing',
            'Receive personalized offers',
            !preferences.dataSharing
          )}
          {renderSettingItem(
            'thirdPartyIntegrations',
            'Third-party Integrations',
            'Allow data sharing with partners',
            !preferences.dataSharing
          )}
        </View>

        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            Privacy Information
          </Text>
          {renderActionButton(
            'View Privacy Policy',
            handleViewPrivacyPolicy
          )}
          {renderActionButton(
            'Delete All Data',
            handleDeleteData,
            'destructive'
          )}
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
});

export default PrivacySettingsScreen; 