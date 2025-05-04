import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Keyboard
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface BeautySearchProps {
  searchTerm: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const BeautySearch: React.FC<BeautySearchProps> = ({
  searchTerm,
  onChangeText,
  onClear,
  placeholder = 'Search beauty services...',
  autoFocus = false
}) => {
  const { isDarkMode } = useTheme();
  const [isFocused, setIsFocused] = useState(autoFocus);
  const animatedWidth = new Animated.Value(isFocused ? 1 : 0);

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, animatedWidth]);

  const handleSubmit = () => {
    Keyboard.dismiss();
  };

  const width = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['100%', '85%'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.searchContainer,
          {
            backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
            borderColor: isDarkMode ? '#333333' : '#E0E0E0',
            width
          },
        ]}
      >
        <Feather
          name="search"
          size={20}
          color={isDarkMode ? '#BBBBBB' : '#666666'}
          style={styles.searchIcon}
        />
        <TextInput
          style={[
            styles.input,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}
          placeholder={placeholder}
          placeholderTextColor={isDarkMode ? '#777777' : '#AAAAAA'}
          value={searchTerm}
          onChangeText={onChangeText}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          autoFocus={autoFocus}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={onClear} style={styles.clearButton}>
            <Feather
              name="x"
              size={18}
              color={isDarkMode ? '#BBBBBB' : '#666666'}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      {isFocused && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            setIsFocused(false);
            Keyboard.dismiss();
          }}
        >
          <Text
            style={[
              styles.cancelButtonText,
              { color: isDarkMode ? '#FFFFFF' : '#4F46E5' }
            ]}
          >
            Cancel
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    padding: 0,
  },
  clearButton: {
    padding: 5,
  },
  cancelButton: {
    marginLeft: 10,
    paddingVertical: 5,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default BeautySearch; 