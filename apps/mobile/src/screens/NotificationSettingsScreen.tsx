import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';

interface NotificationPreferences {
  appointments: boolean;
  reminders: boolean;
  promotions: boolean;
  news: boolean;
  messages: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
}

const NotificationSettingsScreen: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    appointments: true,
    reminders: true,
    promotions: false,
    news: false,
    messages: true,
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
    checkNotificationPermissions();
  }, []);

  const loadPreferences = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      const saved = await AsyncStorage.getItem('@vibewell/notification_preferences');
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
      Alert.alert('Error', 'Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');newPreferences: NotificationPreferences) => {
    try {
      await AsyncStorage.setItem(
        '@vibewell/notification_preferences',
        JSON.stringify(newPreferences)
      );
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      Alert.alert('Error', 'Failed to save notification preferences');
    }
  };

  const checkNotificationPermissions = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    if (Platform.OS === 'ios') {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        setPreferences(prev => ({
          ...prev,
          pushNotifications: false
        }));
      }
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key]
    };

    // If push notifications are disabled, disable all push-related preferences
    if (key === 'pushNotifications' && !newPreferences.pushNotifications) {
      newPreferences.appointments = false;
      newPreferences.reminders = false;
      newPreferences.promotions = false;
      newPreferences.news = false;
      newPreferences.messages = false;
      newPreferences.soundEnabled = false;
    }

    savePreferences(newPreferences);
  };

  const renderSettingItem = (
    key: keyof NotificationPreferences,
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
          Notification Settings
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            Notification Channels
          </Text>
          {renderSettingItem(
            'pushNotifications',
            'Push Notifications',
            'Receive notifications on your device'
          )}
          {renderSettingItem(
            'emailNotifications',
            'Email Notifications',
            'Receive notifications via email'
          )}
        </View>

        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            Notification Types
          </Text>
          {renderSettingItem(
            'appointments',
            'Appointments',
            'Updates about your upcoming appointments',
            !preferences.pushNotifications
          )}
          {renderSettingItem(
            'reminders',
            'Reminders',
            'Reminders for scheduled services',
            !preferences.pushNotifications
          )}
          {renderSettingItem(
            'messages',
            'Messages',
            'New messages from service providers',
            !preferences.pushNotifications
          )}
          {renderSettingItem(
            'promotions',
            'Promotions',
            'Special offers and discounts',
            !preferences.pushNotifications
          )}
          {renderSettingItem(
            'news',
            'News & Updates',
            'Latest news and app updates',
            !preferences.pushNotifications
          )}
        </View>

        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            Sound & Vibration
          </Text>
          {renderSettingItem(
            'soundEnabled',
            'Sound',
            'Play sound for notifications',
            !preferences.pushNotifications
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
});

export default NotificationSettingsScreen; 