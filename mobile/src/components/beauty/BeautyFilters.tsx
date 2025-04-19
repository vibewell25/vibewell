import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Switch,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { MaterialIcons } from '@expo/vector-icons';
import { BeautyFilter } from '../../types/beauty';

interface BeautyFiltersProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: BeautyFilter) => void;
  initialFilters: BeautyFilter;
  isDarkMode: boolean;
}

const DEFAULT_FILTERS: BeautyFilter = {
  minPrice: 0,
  maxPrice: 500,
  minDuration: 15,
  maxDuration: 180,
  minRating: 0,
  featured: undefined
};

const BeautyFilters: React.FC<BeautyFiltersProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters,
  isDarkMode
}) => {
  const [filters, setFilters] = useState<BeautyFilter>(initialFilters || DEFAULT_FILTERS);
  
  useEffect(() => {
    if (visible) {
      setFilters(initialFilters || DEFAULT_FILTERS);
    }
  }, [visible, initialFilters]);

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleApplyFilters = () => {
    onApply(filters);
  };

  const updateFilter = <K extends keyof BeautyFilter>(key: K, value: BeautyFilter[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const themeText = isDarkMode ? styles.darkText : styles.lightText;
  const themeBackground = isDarkMode ? styles.darkBackground : styles.lightBackground;
  const themeInput = isDarkMode ? styles.darkInput : styles.lightInput;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.centeredView, isDarkMode ? styles.darkOverlay : styles.lightOverlay]}>
        <View style={[styles.modalView, themeBackground]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, themeText]}>Filter Services</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={isDarkMode ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.filtersContainer}>
            {/* Price Range */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterTitle, themeText]}>Price Range</Text>
              <View style={styles.rangeLabels}>
                <Text style={[styles.rangeLabel, themeText]}>${filters.minPrice}</Text>
                <Text style={[styles.rangeLabel, themeText]}>${filters.maxPrice}</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={filters.minPrice || 0}
                onValueChange={(value) => updateFilter('minPrice', Math.round(value))}
                minimumTrackTintColor={isDarkMode ? '#5f9ea0' : '#007bff'}
                maximumTrackTintColor={isDarkMode ? '#555' : '#d3d3d3'}
                thumbTintColor={isDarkMode ? '#90ee90' : '#007bff'}
              />
              <Slider
                style={styles.slider}
                minimumValue={100}
                maximumValue={1000}
                value={filters.maxPrice || 500}
                onValueChange={(value) => updateFilter('maxPrice', Math.round(value))}
                minimumTrackTintColor={isDarkMode ? '#5f9ea0' : '#007bff'}
                maximumTrackTintColor={isDarkMode ? '#555' : '#d3d3d3'}
                thumbTintColor={isDarkMode ? '#90ee90' : '#007bff'}
              />
            </View>
            
            {/* Duration */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterTitle, themeText]}>Duration (minutes)</Text>
              <View style={styles.rangeLabels}>
                <Text style={[styles.rangeLabel, themeText]}>{filters.minDuration} min</Text>
                <Text style={[styles.rangeLabel, themeText]}>{filters.maxDuration} min</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={15}
                maximumValue={60}
                value={filters.minDuration || 15}
                onValueChange={(value) => updateFilter('minDuration', Math.round(value))}
                minimumTrackTintColor={isDarkMode ? '#5f9ea0' : '#007bff'}
                maximumTrackTintColor={isDarkMode ? '#555' : '#d3d3d3'}
                thumbTintColor={isDarkMode ? '#90ee90' : '#007bff'}
              />
              <Slider
                style={styles.slider}
                minimumValue={60}
                maximumValue={240}
                value={filters.maxDuration || 180}
                onValueChange={(value) => updateFilter('maxDuration', Math.round(value))}
                minimumTrackTintColor={isDarkMode ? '#5f9ea0' : '#007bff'}
                maximumTrackTintColor={isDarkMode ? '#555' : '#d3d3d3'}
                thumbTintColor={isDarkMode ? '#90ee90' : '#007bff'}
              />
            </View>
            
            {/* Rating */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterTitle, themeText]}>Minimum Rating</Text>
              <View style={styles.ratingContainer}>
                {[0, 1, 2, 3, 4, 5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={styles.ratingButton}
                    onPress={() => updateFilter('minRating', rating)}
                  >
                    <Text style={[
                      styles.ratingText,
                      filters.minRating === rating && styles.selectedRating,
                      isDarkMode && styles.darkRatingText
                    ]}>
                      {rating === 0 ? 'Any' : `${rating}★+`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Featured Toggle */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterTitle, themeText]}>Featured Only</Text>
              <View style={styles.toggleContainer}>
                <Switch
                  value={filters.featured || false}
                  onValueChange={(value) => updateFilter('featured', value)}
                  trackColor={{ false: '#d3d3d3', true: isDarkMode ? '#5f9ea0' : '#007bff' }}
                  thumbColor={filters.featured ? isDarkMode ? '#90ee90' : '#007bff' : '#f4f3f4'}
                />
                <Text style={[styles.toggleLabel, themeText]}>
                  {filters.featured ? 'Show only featured services' : 'Show all services'}
                </Text>
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.resetButton, isDarkMode && styles.darkResetButton]} 
              onPress={handleReset}
            >
              <Text style={[styles.buttonText, isDarkMode && styles.darkButtonText]}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.applyButton, isDarkMode && styles.darkApplyButton]} 
              onPress={handleApplyFilters}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  lightOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  darkOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalView: {
    width: '100%',
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  lightBackground: {
    backgroundColor: 'white',
  },
  darkBackground: {
    backgroundColor: '#222',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  lightText: {
    color: '#000',
  },
  darkText: {
    color: '#fff',
  },
  filtersContainer: {
    flex: 1,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  lightInput: {
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    color: '#000',
  },
  darkInput: {
    borderColor: '#444',
    backgroundColor: '#333',
    color: '#fff',
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rangeLabel: {
    fontSize: 14,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  ratingButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#000',
  },
  darkRatingText: {
    color: '#eee',
  },
  selectedRating: {
    fontWeight: 'bold',
    color: '#007bff',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    marginLeft: 10,
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  darkResetButton: {
    borderColor: '#444',
  },
  applyButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
    flex: 2,
    alignItems: 'center',
  },
  darkApplyButton: {
    backgroundColor: '#4F46E5',
  },
  buttonText: {
    fontSize: 16,
    color: '#007bff',
  },
  darkButtonText: {
    color: '#5f9ea0',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default BeautyFilters; 