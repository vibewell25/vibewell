import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  TextInput,
  StatusBar
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BeautyScreenNavigationProp } from '../types/navigation';
import { BeautyService, BeautyCategory, BeautyFilter } from '../types/beauty';
import BeautyServiceCard from '../components/beauty/BeautyServiceCard';
import BeautyFilters from '../components/beauty/BeautyFilters';
import BeautySearch from '../components/beauty/BeautySearch';
import { 
  getBeautyServices, 
  getBeautyCategories, 
  getFeaturedBeautyServices,
  searchBeautyServices
} from '../services/beautyService';

const BeautyScreen: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigation = useNavigation<BeautyScreenNavigationProp>();
  const [loading, setLoading] = useState<boolean>(true);
  const [services, setServices] = useState<BeautyService[]>([]);
  const [featuredServices, setFeaturedServices] = useState<BeautyService[]>([]);
  const [categories, setCategories] = useState<BeautyCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<BeautyFilter>({});
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getBeautyCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching beauty categories:', error);
      }
    };
    
    const fetchFeaturedServices = async () => {
      try {
        const featuredData = await getFeaturedBeautyServices();
        setFeaturedServices(featuredData);
      } catch (error) {
        console.error('Error fetching featured services:', error);
      }
    };
    
    fetchCategories();
    fetchFeaturedServices();
  }, []);
  
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        // Combine category selection with other filters
        const combinedFilters: BeautyFilter = {
          ...filters
        };
        
        if (selectedCategoryId) {
          combinedFilters.categoryId = selectedCategoryId;
        }
        
        const servicesData = await searchBeautyServices(searchTerm, combinedFilters);
        setServices(servicesData);
      } catch (error) {
        console.error('Error fetching beauty services:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, [selectedCategoryId, filters, searchTerm]);
  
  const handleServicePress = (serviceId: string) => {
    navigation.navigate('BeautyServiceDetail', { serviceId });
  };
  
  const handleApplyFilters = (newFilters: BeautyFilter) => {
    setFilters(newFilters);
    setShowFilters(false);
  };
  
  const handleClearFilters = () => {
    setFilters({});
    setSelectedCategoryId('');
    setSearchTerm('');
  };
  
  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
  };
  
  const getAppliedFiltersCount = () => {
    let count = 0;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count++;
    if (filters.minDuration !== undefined || filters.maxDuration !== undefined) count++;
    if (filters.minRating !== undefined) count++;
    if (filters.featured !== undefined) count++;
    if (searchTerm) count++;
    if (selectedCategoryId) count++;
    
    return count;
  };
  
  const renderFeaturedSection = () => {
    if (featuredServices.length === 0) return null;
    
    return (
      <View style={styles.featuredSection}>
        <Text style={[
          styles.sectionTitle,
          { color: isDarkMode ? '#FFFFFF' : '#000000' }
        ]}>
          Featured Services
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.featuredContainer}
        >
          {featuredServices.map(service => (
            <View key={service.id} style={styles.featuredItem}>
              <BeautyServiceCard
                service={service}
                onPress={() => handleServicePress(service.id)}
                isDarkMode={isDarkMode}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };
  
  const filtersCount = getAppliedFiltersCount();
  
  return (
    <View style={[styles.container, {backgroundColor: isDarkMode ? '#121212' : '#F5F5F5'}]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={[styles.header, {color: isDarkMode ? '#FFFFFF' : '#000000'}]}>Beauty</Text>
        
        {/* Search Bar */}
        <BeautySearch 
          searchTerm={searchTerm}
          onChangeText={handleSearchChange}
          onClear={() => setSearchTerm('')}
        />
        
        {/* Filter Button */}
        <TouchableOpacity 
          style={[
            styles.filterButton,
            {backgroundColor: isDarkMode ? '#2A2A2A' : '#FFFFFF'}
          ]}
          onPress={() => setShowFilters(true)}
        >
          <Text style={{
            color: isDarkMode ? '#FFFFFF' : '#000000',
            marginRight: 5
          }}>
            Filter
          </Text>
          <Feather name="filter" size={18} color={isDarkMode ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
      </View>
      
      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          <TouchableOpacity
            key="all"
            style={[styles.categoryButton, { backgroundColor: selectedCategoryId === '' ? '#4F46E5' : isDarkMode ? '#2A2A2A' : '#FFFFFF' }]}
            onPress={() => setSelectedCategoryId('')}
          >
            <Text style={[styles.categoryText, { color: selectedCategoryId === '' ? '#FFFFFF' : isDarkMode ? '#BBBBBB' : '#000000' }]}>All</Text>
          </TouchableOpacity>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryButton, { backgroundColor: selectedCategoryId === category.id ? '#4F46E5' : isDarkMode ? '#2A2A2A' : '#FFFFFF' }]}
              onPress={() => setSelectedCategoryId(selectedCategoryId === category.id ? '' : category.id)}
            >
              <Text style={[styles.categoryText, { color: selectedCategoryId === category.id ? '#FFFFFF' : isDarkMode ? '#BBBBBB' : '#000000' }]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Active Filters */}
      {Object.keys(filters).length > 0 && (
        <View style={styles.activeFiltersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.entries(filters).map(([key, value]) => {
              if (!value && value !== 0) return null;
              let filterText;
              switch(key) {
                case 'categoryId':
                  const categoryName = categories.find(c => c.id === value)?.name || '';
                  filterText = `Category: ${categoryName}`;
                  break;
                case 'minPrice':
                  filterText = `Min Price: $${value}`;
                  break;
                case 'maxPrice':
                  filterText = `Max Price: $${value}`;
                  break;
                case 'minDuration':
                  filterText = `Min Duration: ${value}min`;
                  break;
                case 'maxDuration':
                  filterText = `Max Duration: ${value}min`;
                  break;
                case 'minRating':
                  filterText = `Min Rating: ${value}★`;
                  break;
                default:
                  filterText = `${key}: ${value}`;
              }
              return (
                <TouchableOpacity 
                  key={key}
                  style={[
                    styles.filterTag,
                    {backgroundColor: isDarkMode ? '#2A2A2A' : '#FFFFFF'}
                  ]}
                  onPress={() => {
                    const newFilters = { ...filters };
                    delete newFilters[key];
                    setFilters(newFilters);
                  }}
                >
                  <Text style={{color: isDarkMode ? '#FFFFFF' : '#000000'}}>{filterText}</Text>
                  <Feather name="x" size={16} color={isDarkMode ? '#FFFFFF' : '#000000'} />
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity 
              style={[
                styles.clearFiltersButton,
                {backgroundColor: isDarkMode ? '#2A2A2A' : '#FFFFFF'}
              ]}
              onPress={handleClearFilters}
            >
              <Text style={{color: '#FF5252'}}>Clear All</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
      
      {/* Main Content */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.mainContent}>
        {/* Featured Services */}
        {!searchTerm && !selectedCategoryId && Object.keys(filters).length === 0 && renderFeaturedSection()}
        
        {/* Service Listing */}
        <View style={styles.servicesSection}>
          <Text style={[
            styles.sectionTitle,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            {searchTerm || selectedCategoryId || Object.keys(filters).length > 0
              ? 'Search Results'
              : 'All Services'}
          </Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#4F46E5" style={styles.loader} />
          ) : services.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="search-off" size={48} color={isDarkMode ? '#666666' : '#999999'} />
              <Text style={[
                styles.emptyStateText,
                { color: isDarkMode ? '#FFFFFF' : '#000000' }
              ]}>
                No services found
              </Text>
              <Text style={[
                styles.emptyStateSubtext,
                { color: isDarkMode ? '#BBBBBB' : '#666666' }
              ]}>
                Try adjusting your filters or search terms
              </Text>
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={handleClearFilters}
              >
                <Text style={styles.clearFiltersText}>Clear All Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.servicesGrid}>
              {services.map(service => (
                <View key={service.id} style={styles.serviceCardContainer}>
                  <BeautyServiceCard
                    service={service}
                    onPress={() => handleServicePress(service.id)}
                    isDarkMode={isDarkMode}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Filters Modal */}
      <BeautyFilters
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
        isDarkMode={isDarkMode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginRight: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },
  clearFiltersButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearFiltersText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
  },
  featuredSection: {
    marginBottom: 20,
  },
  featuredContainer: {
    marginTop: 10,
  },
  featuredItem: {
    marginRight: 12,
    width: 280,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  servicesSection: {
    marginBottom: 20,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCardContainer: {
    width: '48%',
    marginBottom: 16,
  },
  loader: {
    marginTop: 30,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default BeautyScreen; 