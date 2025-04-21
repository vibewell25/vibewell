import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n, { initializeI18n } from '../i18n';
import LanguageSelector from '../components/LanguageSelector';

// Settings screen component
const SettingsScreen: React.FC = () => {
  // Initialize translations
  useEffect(() => {
    initializeI18n();
  }, []);

  // State for dark mode
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  // State for notifications
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  // State for biometric login
  const [biometricLoginEnabled, setBiometricLoginEnabled] = React.useState(false);

  // Toggle dark mode
  const toggleDarkMode = async (value: boolean) => {
    setIsDarkMode(value);
    await AsyncStorage.setItem('@vibewell/dark_mode', value ? 'true' : 'false');
    // TODO: Implement actual theme switch
  };

  // Toggle notifications
  const toggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem('@vibewell/notifications_enabled', value ? 'true' : 'false');
    // TODO: Implement notification permission handling
  };

  // Toggle biometric login
  const toggleBiometricLogin = async (value: boolean) => {
    setBiometricLoginEnabled(value);
    await AsyncStorage.setItem('@vibewell/biometric_login', value ? 'true' : 'false');
    // TODO: Implement biometric authentication setup
  };

  // Handle language change
  const handleLanguageChange = (locale: string) => {
    // Reload the component or update the UI as needed
    console.log(`Language changed to: ${locale}`);
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
          <LanguageSelector onLanguageChange={handleLanguageChange} />
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
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  versionText: {
    fontSize: 16,
    color: '#888',
  },
  logoutButton: {
    marginTop: 36,
    marginBottom: 24,
    marginHorizontal: 16,
    backgroundColor: '#ff6347',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  languageContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});

export default SettingsScreen; 