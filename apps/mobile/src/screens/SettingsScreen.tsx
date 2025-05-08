import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Platform, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n, { initializeI18n } from '../i18n';
import LanguageSelector from '../components/LanguageSelector';
import { useTheme } from '../contexts/ThemeContext';
import * as Notifications from 'expo-notifications';
import * as LocalAuthentication from 'expo-local-authentication';

// Settings screen component
const SettingsScreen: React.FC = () => {
  // Initialize translations
  useEffect(() => {
    initializeI18n();
    loadSettings();
  }, []);

  // Use the theme context
  const { isDarkMode, setTheme } = useTheme();
  // State for notifications
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);
  // State for biometric login
  const [biometricLoginEnabled, setBiometricLoginEnabled] = React.useState(false);
  // State for language selector visibility
  const [isLanguageSelectorVisible, setIsLanguageSelectorVisible] = React.useState(false);
  // State for biometric availability
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  // Load user settings on component mount
  const loadSettings = async () => {
    try {
      // Load notification permission status
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationsEnabled(status === 'granted');

      // Check if biometric authentication is available
      const biometricAvailable = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricAvailable(biometricAvailable);
      
      if (biometricAvailable) {
        const biometricEnabled = await AsyncStorage.getItem('@vibewell/biometric_login');
        setBiometricLoginEnabled(biometricEnabled === 'true');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = async (value: boolean) => {
    try {
      setTheme(value ? 'dark' : 'light');
      await AsyncStorage.setItem('@vibewell/dark_mode', value ? 'true' : 'false');
    } catch (error) {
      console.error('Error toggling theme:', error);
      Alert.alert('Error', 'Failed to update theme setting');
    }
  };

  // Toggle notifications
  const toggleNotifications = async (value: boolean) => {
    try {
      if (value) {
        const { status, canAskAgain } = await Notifications.getPermissionsAsync();
        
        if (status !== 'granted') {
          if (canAskAgain) {
            const { status: newStatus } = await Notifications.requestPermissionsAsync();
            
            if (newStatus !== 'granted') {
              Alert.alert(
                'Permission Required',
                'Please enable notifications in your device settings to receive updates.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Settings', 
                    onPress: () => Platform.OS === 'ios' 
                      ? Linking.openURL('app-settings:') 
                      : Linking.openSettings() 
                  }
                ]
              );
              return;
            }
          } else {
            Alert.alert(
              'Permission Required',
              'Please enable notifications in your device settings to receive updates.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Settings', 
                  onPress: () => Platform.OS === 'ios' 
                    ? Linking.openURL('app-settings:') 
                    : Linking.openSettings() 
                }
              ]
            );
            return;
          }
        }
      }
      
      setNotificationsEnabled(value);
      await AsyncStorage.setItem('@vibewell/notifications_enabled', value ? 'true' : 'false');
      
      // Configure notification behavior based on user preference
      if (value) {
        // Set up notification handlers and channels if needed
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  // Toggle biometric login
  const toggleBiometricLogin = async (value: boolean) => {
    try {
      // Check if biometric hardware is available
      const compatible = await LocalAuthentication.hasHardwareAsync();
      
      if (!compatible) {
        Alert.alert(
          'Incompatible Device',
          'Your device does not support biometric authentication.'
        );
        return;
      }
      
      // Check enrolled biometrics
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!enrolled) {
        Alert.alert(
          'No Biometrics Found',
          'Please set up biometric authentication in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Settings', 
              onPress: () => Platform.OS === 'ios' 
                ? Linking.openURL('app-settings:') 
                : Linking.openSettings() 
            }
          ]
        );
        return;
      }
      
      // If enabling, verify with biometric auth first
      if (value) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to enable biometric login',
          fallbackLabel: 'Use passcode',
        });
        
        if (!result.success) {
          return; // Authentication failed or was canceled
        }
      }
      
      setBiometricLoginEnabled(value);
      await AsyncStorage.setItem('@vibewell/biometric_login', value ? 'true' : 'false');
    } catch (error) {
      console.error('Error toggling biometric login:', error);
      Alert.alert('Error', 'Failed to update biometric settings');
    }
  };

  // Handle language change
  const handleLanguageChange = (locale: string) => {
    // Reload the component or update the UI as needed
    console.log(`Language changed to: ${locale}`);
  };

  // Handle language selector close
  const handleLanguageSelectorClose = () => {
    setIsLanguageSelectorVisible(false);
  };

  // Render a settings section header
  const renderSectionHeader = (title: string) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  // Render a settings item with toggle
  const renderToggleItem = (
    title: string, 
    value: boolean, 
    onToggle: (value: boolean) => void,
    icon: string
  ) => (
    <View style={styles.settingsItem}>
      <View style={styles.itemLeft}>
        <Ionicons name={icon as any} size={24} color="#555" style={styles.itemIcon} />
        <Text style={styles.itemText}>{title}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#d0d0d0', true: '#4CAF50' }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
      />
    </View>
  );

  // Render a settings item with chevron
  const renderChevronItem = (
    title: string, 
    onPress: () => void,
    icon: string
  ) => (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={styles.itemLeft}>
        <Ionicons name={icon as any} size={24} color="#555" style={styles.itemIcon} />
        <Text style={styles.itemText}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#888" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>{i18n.t('settings.title')}</Text>

        {/* App Settings */}
        {renderSectionHeader(i18n.t('settings.appearance'))}
        {renderToggleItem(
          i18n.t('profile.darkMode'),
          isDarkMode,
          toggleDarkMode,
          'moon-outline'
        )}
        
        {/* Language Settings */}
        {renderSectionHeader(i18n.t('settings.language'))}
        <View style={styles.languageContainer}>
          <TouchableOpacity onPress={() => setIsLanguageSelectorVisible(true)}>
            <Text style={styles.itemText}>{i18n.t('settings.language')}</Text>
          </TouchableOpacity>
          <LanguageSelector 
            isVisible={isLanguageSelectorVisible} 
            onClose={handleLanguageSelectorClose} 
            onLanguageChange={handleLanguageChange} 
          />
        </View>

        {/* Notification Settings */}
        {renderSectionHeader(i18n.t('settings.notifications'))}
        {renderToggleItem(
          i18n.t('settings.notifications'),
          notificationsEnabled,
          toggleNotifications,
          'notifications-outline'
        )}

        {/* Security Settings */}
        {renderSectionHeader(i18n.t('settings.privacy'))}
        {renderToggleItem(
          i18n.t('profile.biometricLogin'),
          biometricLoginEnabled,
          toggleBiometricLogin,
          'finger-print-outline'
        )}
        
        {/* Support */}
        {renderSectionHeader(i18n.t('settings.help'))}
        {renderChevronItem(
          i18n.t('settings.contactUs'),
          () => console.log('Contact us pressed'),
          'mail-outline'
        )}
        {renderChevronItem(
          i18n.t('settings.terms'),
          () => console.log('Terms pressed'),
          'document-text-outline'
        )}
        {renderChevronItem(
          i18n.t('settings.privacyPolicy'),
          () => console.log('Privacy policy pressed'),
          'shield-checkmark-outline'
        )}
        
        {/* About */}
        {renderSectionHeader(i18n.t('settings.about'))}
        <View style={styles.settingsItem}>
          <View style={styles.itemLeft}>
            <Ionicons name="information-circle-outline" size={24} color="#555" style={styles.itemIcon} />
            <Text style={styles.itemText}>{i18n.t('settings.version')}</Text>
          </View>
          <Text style={styles.versionText}>1.0.0</Text>
        </View>
        
        {/* Logout */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => console.log('Logout pressed')}
        >
          <Text style={styles.logoutText}>{i18n.t('settings.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
itemIcon: {
    marginRight: 12,
itemText: {
    fontSize: 16,
    color: '#333',
versionText: {
    fontSize: 16,
    color: '#888',
logoutButton: {
    marginTop: 36,
    marginBottom: 24,
    marginHorizontal: 16,
    backgroundColor: '#ff6347',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
languageContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
export default SettingsScreen; 