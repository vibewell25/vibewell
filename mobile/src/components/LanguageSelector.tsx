import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import i18n, { getAvailableLocales, setLanguage, LanguageOption } from '../i18n';

interface LanguageSelectorProps {
  isVisible: boolean;
  onClose: () => void;
  showFlags?: boolean;
  showLocalNames?: boolean;
  onLanguageChange?: (locale: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  isVisible,
  onClose,
  showFlags = true,
  showLocalNames = true,
  onLanguageChange,
}) => {
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(i18n.getCurrentLocale());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Get available languages
    setLanguages(getAvailableLocales());
  }, []);

  const handleLanguageSelect = async (languageCode: string) => {
    if (languageCode === selectedLanguage) {
      return;
    }

    setIsLoading(true);
    try {
      const success = await setLanguage(languageCode);
      if (success) {
        setSelectedLanguage(languageCode);
        onLanguageChange?.(languageCode);
        // Wait a moment to show the loading indicator before closing
        setTimeout(() => {
          setIsLoading(false);
          onClose();
        }, 500);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error changing language:', error);
      setIsLoading(false);
    }
  };

  const renderLanguageItem = ({ item }: { item: LanguageOption }) => {
    const isSelected = item.code === selectedLanguage;

    return (
      <TouchableOpacity
        style={[styles.languageItem, isSelected && styles.selectedLanguageItem]}
        onPress={() => handleLanguageSelect(item.code)}
        disabled={isLoading}
      >
        {showFlags && <Text style={styles.flag}>{item.flag}</Text>}
        <View style={styles.languageTextContainer}>
          <Text style={[styles.languageName, isSelected && styles.selectedText]}>
            {item.name}
          </Text>
          {showLocalNames && item.localName !== item.name && (
            <Text style={[styles.localName, isSelected && styles.selectedText]}>
              {item.localName}
            </Text>
          )}
        </View>
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{i18n.t('settings.language')}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} disabled={isLoading}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>{i18n.t('settings.selectLanguage')}</Text>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0066CC" />
              <Text style={styles.loadingText}>{i18n.t('common.loading')}</Text>
            </View>
          ) : (
            <FlatList
              data={languages}
              renderItem={renderLanguageItem}
              keyExtractor={(item) => item.code}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    marginTop: 'auto',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '60%',
    paddingBottom: Platform.OS === 'ios' ? 0 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 20,
    marginTop: 10,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedLanguageItem: {
    backgroundColor: 'rgba(0, 102, 204, 0.05)',
  },
  flag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageTextContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    color: '#333',
  },
  localName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  selectedText: {
    color: '#0066CC',
    fontWeight: 'bold',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  checkmarkText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default LanguageSelector;