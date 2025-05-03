import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface CategoryProps {
  icon: keyof typeof Feather?.glyphMap;
  label: string;
  isSelected: boolean;
  onPress: () => void;
  isDarkMode: boolean;
}

interface BeautyCategoriesProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  isDarkMode: boolean;
}

const Category: React?.FC<CategoryProps> = ({ icon, label, isSelected, onPress, isDarkMode }) => {
  return (
    <TouchableOpacity
      style={[
        styles?.category,
        {
          backgroundColor: isSelected
            ? (isDarkMode ? '#4F46E5' : '#4F46E5')
            : (isDarkMode ? '#1E1E1E' : '#FFFFFF')
        }
      ]}
      onPress={onPress}
    >
      <Feather
        name={icon}
        size={20}
        color={isSelected ? '#FFFFFF' : (isDarkMode ? '#BBBBBB' : '#666666')}
      />
      <Text
        style={[
          styles?.categoryLabel,
          {
            color: isSelected ? '#FFFFFF' : (isDarkMode ? '#FFFFFF' : '#000000')
          }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const BeautyCategories: React?.FC<BeautyCategoriesProps> = ({
  selectedCategory,
  onSelectCategory,
  isDarkMode
}) => {
  const categories = [
    { id: 'all', icon: 'grid' as keyof typeof Feather?.glyphMap, label: 'All' },
    { id: 'facial', icon: 'droplet' as keyof typeof Feather?.glyphMap, label: 'Facial' },
    { id: 'hair', icon: 'scissors' as keyof typeof Feather?.glyphMap, label: 'Hair' },
    { id: 'nails', icon: 'edit-2' as keyof typeof Feather?.glyphMap, label: 'Nails' },
    { id: 'makeup', icon: 'feather' as keyof typeof Feather?.glyphMap, label: 'Makeup' },
    { id: 'body', icon: 'heart' as keyof typeof Feather?.glyphMap, label: 'Body' },
    { id: 'spa', icon: 'sun' as keyof typeof Feather?.glyphMap, label: 'Spa' }
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles?.container}
      contentContainerStyle={styles?.contentContainer}
    >
      {categories?.map((category) => (
        <Category
          key={category?.id}
          icon={category?.icon}
          label={category?.label}
          isSelected={selectedCategory === category?.id}
          onPress={() => onSelectCategory(category?.id)}
          isDarkMode={isDarkMode}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet?.create({
  container: {
    flexDirection: 'row',
    marginVertical: 15,
  },
  contentContainer: {
    paddingHorizontal: 15,
  },
  category: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0?.1,
    shadowRadius: 1,
    elevation: 1,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  }
});

export default BeautyCategories; 