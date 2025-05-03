import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  FlatList,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  BeautyServiceDetailNavigationProp, 
  BeautyServiceDetailRouteProp,
  BeautyServiceDetails,
  Review
} from '../types/navigation';
import { BeautyService } from '../types/beauty';
import { getBeautyServiceById, getSimilarBeautyServices, getServiceReviews } from '../services/beautyService';
import ReviewList from '../components/beauty/ReviewList';
import BeautyReviewCard from '../components/beauty/BeautyReviewCard';
import BeautyReviewForm from '../components/beauty/BeautyReviewForm';

const { width } = Dimensions?.get('window');

const BeautyServiceDetailScreen: React?.FC = () => {
  const { isDarkMode } = useTheme();
  const navigation = useNavigation<BeautyServiceDetailNavigationProp>();
  const route = useRoute<BeautyServiceDetailRouteProp>();
  const { serviceId } = route?.params;
  
  const [service, setService] = useState<BeautyServiceDetails | null>(null);
  const [similarServices, setSimilarServices] = useState<BeautyService[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  
  useEffect(() => {
    fetchServiceDetails();
  }, [serviceId]);
  
  const fetchServiceDetails = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
    setLoading(true);
    try {
      const serviceData = await getBeautyServiceById(serviceId);
      
      if (!serviceData) {
        // Handle service not found
        setLoading(false);
        return;
      }
      
      setService(serviceData);
      
      // Fetch similar services in parallel
      const similarServicesData = await getSimilarBeautyServices(serviceId);
      setSimilarServices(similarServicesData);
      
      // Fetch most recent reviews
      const reviewsData = await getServiceReviews(serviceId);
      
      // Update the service with the latest reviews
      setService(prevService => {
        if (!prevService) return null;
        return {
          ...prevService,
          reviews: reviewsData
        };
      });
      
      // If service has reviews, use them
      if (serviceData?.reviews) {
        setReviews(serviceData?.reviews);
      } else {
        // Otherwise fetch reviews separately
        const fetchedReviews = await getServiceReviews(serviceId);
        setReviews(fetchedReviews);
      }
    } catch (error) {
      console?.error("Error fetching service details:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
    setRefreshing(true);
    await fetchServiceDetails();
    setRefreshing(false);
  };
  
  const handleBookNow = () => {
    if (service) {
      navigation?.navigate('BeautyBooking', { service });
    }
  };
  
  const handleSimilarServicePress = (similarServiceId: string) => {
    navigation?.replace('BeautyServiceDetail', { serviceId: similarServiceId });
  };
  
  if (loading) {
    return (
      <View 
        style={[
          styles?.loadingContainer, 
          { backgroundColor: isDarkMode ? '#121212' : '#F8F8F8' }
        ]}
      >
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }
  
  if (!service) {
    return (
      <View 
        style={[
          styles?.errorContainer, 
          { backgroundColor: isDarkMode ? '#121212' : '#F8F8F8' }
        ]}
      >
        <Feather name="alert-circle" size={50} color="#FF4D4F" />
        <Text 
          style={[
            styles?.errorText,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}
        >
          Service not found
        </Text>
        <TouchableOpacity
          style={styles?.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Text style={styles?.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View 
      style={[
        styles?.container,
        { backgroundColor: isDarkMode ? '#121212' : '#F8F8F8' }
      ]}
    >
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header with back button */}
      <View style={styles?.header}>
        <TouchableOpacity
          style={[
            styles?.headerButton,
            { backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0?.7)' : 'rgba(255, 255, 255, 0?.7)' }
          ]}
          onPress={() => navigation?.goBack()}
        >
          <Feather name="arrow-left" size={20} color={isDarkMode ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles?.headerButton,
            { backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0?.7)' : 'rgba(255, 255, 255, 0?.7)' }
          ]}
        >
          <Feather name="share" size={20} color={isDarkMode ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles?.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={['#4F46E5']}
            tintColor={isDarkMode ? '#4F46E5' : '#4F46E5'}
          />
        }
      >
        {/* Main Image */}
        <Image 
          source={{ uri: service?.imageUrls[activeImageIndex] }}
          style={styles?.mainImage}
          resizeMode="cover"
        />
        
        {/* Content Container */}
        <View 
          style={[
            styles?.contentContainer,
            { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }
          ]}
        >
          {/* Service Title and Provider */}
          <View style={styles?.titleContainer}>
            <Text 
              style={[
                styles?.serviceTitle,
                { color: isDarkMode ? '#FFFFFF' : '#000000' }
              ]}
            >
              {service?.title}
            </Text>
            
            <View style={styles?.providerContainer}>
              <Text 
                style={[
                  styles?.providerText,
                  { color: isDarkMode ? '#BBBBBB' : '#666666' }
                ]}
              >
                Provider ID: {service?.providerId}
              </Text>
              <View style={styles?.ratingContainer}>
                <Feather name="star" size={14} color="#FFD700" />
                <Text 
                  style={[
                    styles?.ratingText,
                    { color: isDarkMode ? '#FFFFFF' : '#000000' }
                  ]}
                >
                  {service?.rating?.toFixed(1)} ({service?.reviews.length})
                </Text>
              </View>
            </View>
          </View>
          
          {/* Service Details */}
          <View style={styles?.detailsContainer}>
            <View style={styles?.detailItem}>
              <Feather name="clock" size={16} color={isDarkMode ? '#BBBBBB' : '#666666'} />
              <Text 
                style={[
                  styles?.detailText,
                  { color: isDarkMode ? '#FFFFFF' : '#000000' }
                ]}
              >
                {service?.duration}
              </Text>
            </View>
            
            <View style={styles?.detailItem}>
              <Feather name="tag" size={16} color={isDarkMode ? '#BBBBBB' : '#666666'} />
              <Text 
                style={[
                  styles?.detailText,
                  { color: isDarkMode ? '#FFFFFF' : '#000000' }
                ]}
              >
                {service?.price}
              </Text>
            </View>
            
            <View style={styles?.detailItem}>
              <Feather name="map-pin" size={16} color={isDarkMode ? '#BBBBBB' : '#666666'} />
              <Text 
                style={[
                  styles?.detailText,
                  { color: isDarkMode ? '#FFFFFF' : '#000000' }
                ]}
              >
                {service?.categoryId}
              </Text>
            </View>
          </View>
          
          {/* Description */}
          <View style={styles?.descriptionContainer}>
            <Text 
              style={[
                styles?.sectionTitle,
                { color: isDarkMode ? '#FFFFFF' : '#000000' }
              ]}
            >
              Description
            </Text>
            <Text 
              style={[
                styles?.descriptionText,
                { color: isDarkMode ? '#E0E0E0' : '#333333' }
              ]}
            >
              {service?.longDescription}
            </Text>
          </View>
          
          {/* Highlights */}
          <View style={styles?.highlightsContainer}>
            <Text 
              style={[
                styles?.sectionTitle,
                { color: isDarkMode ? '#FFFFFF' : '#000000' }
              ]}
            >
              Highlights
            </Text>
            <View style={styles?.highlightsList}>
              {service?.highlights.map((highlight, index) => (
                <View key={`highlight-${index}`} style={styles?.highlightItem}>
                  <View 
                    style={[
                      styles?.bulletPoint,
                      { backgroundColor: '#4F46E5' }
                    ]}
                  />
                  <Text 
                    style={[
                      styles?.highlightText,
                      { color: isDarkMode ? '#E0E0E0' : '#333333' }
                    ]}
                  >
                    {highlight}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Reviews Section */}
          <View style={styles?.section}>
            <View style={styles?.sectionHeader}>
              <Text style={[
                styles?.sectionTitle,
                { color: isDarkMode ? '#FFFFFF' : '#000000' }
              ]}>
                Reviews ({reviews?.length})
              </Text>
              <TouchableOpacity 
                onPress={() => setShowReviewForm(!showReviewForm)}
                style={styles?.writeReviewButton}
              >
                <Text style={styles?.writeReviewText}>
                  {showReviewForm ? 'Cancel' : 'Write a Review'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Review Form */}
            {showReviewForm && (
              <BeautyReviewForm 
                serviceId={serviceId}
                onReviewAdded={() => {
                  setShowReviewForm(false);
                  // Reload reviews
                  getServiceReviews(serviceId).then(fetchedReviews => {
                    setReviews(fetchedReviews);
                  });
                }}
                isDarkMode={isDarkMode}
              />
            )}
            
            {/* Reviews List */}
            {reviews?.length > 0 ? (
              reviews?.map((review) => (
                <BeautyReviewCard
                  key={review?.id}
                  review={review}
                  isDarkMode={isDarkMode}
                  onLike={() => {}}
                  onReport={() => {
                    Alert?.alert(
                      'Report Review',
                      'Are you sure you want to report this review?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Report', 
                          onPress: () => Alert?.alert('Thanks', 'Thank you for reporting this review. We will review it shortly.') 
                        }
                      ]
                    );
                  }}
                />
              ))
            ) : (
              <Text style={[
                styles?.noReviewsText,
                { color: isDarkMode ? '#BBBBBB' : '#666666' }
              ]}>
                No reviews yet. Be the first to leave a review!
              </Text>
            )}
          </View>
          
          {/* Similar Services */}
          {similarServices?.length > 0 && (
            <View style={styles?.similarServicesContainer}>
              <Text 
                style={[
                  styles?.sectionTitle,
                  { color: isDarkMode ? '#FFFFFF' : '#000000' }
                ]}
              >
                Similar Services
              </Text>
              <FlatList
                data={similarServices}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item?.id}
                contentContainerStyle={styles?.similarServicesList}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[
                      styles?.similarServiceItem,
                      { backgroundColor: isDarkMode ? '#2A2A2A' : '#F0F0F0' }
                    ]}
                    onPress={() => handleSimilarServicePress(item?.id)}
                  >
                    <Image 
                      source={{ uri: item?.imageUrl }}
                      style={styles?.similarServiceImage}
                      resizeMode="cover"
                    />
                    <View style={styles?.similarServiceInfo}>
                      <Text 
                        style={[
                          styles?.similarServiceTitle,
                          { color: isDarkMode ? '#FFFFFF' : '#000000' }
                        ]}
                        numberOfLines={1}
                      >
                        {item?.title}
                      </Text>
                      <Text 
                        style={[
                          styles?.similarServicePrice,
                          { color: isDarkMode ? '#BBBBBB' : '#666666' }
                        ]}
                      >
                        ${item?.price}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Book Now Button */}
      <View 
        style={[
          styles?.bookNowContainer,
          { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }
        ]}
      >
        <TouchableOpacity
          style={styles?.bookNowButton}
          onPress={handleBookNow}
        >
          <Text style={styles?.bookNowText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet?.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 90,
  },
  mainImage: {
    width: '100%',
    height: 300,
  },
  contentContainer: {
    marginTop: 15,
    marginHorizontal: 15,
    borderRadius: 15,
    padding: 15,
  },
  titleContainer: {
    marginBottom: 15,
  },
  serviceTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  providerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerText: {
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 6,
    fontSize: 14,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  highlightsContainer: {
    marginBottom: 20,
  },
  highlightsList: {
    marginTop: 5,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  highlightText: {
    fontSize: 14,
  },
  reviewsContainer: {
    marginBottom: 20,
  },
  similarServicesContainer: {
    marginBottom: 10,
  },
  similarServicesList: {
    paddingVertical: 5,
  },
  similarServiceItem: {
    width: 140,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 10,
  },
  similarServiceImage: {
    width: '100%',
    height: 100,
  },
  similarServiceInfo: {
    padding: 10,
  },
  similarServiceTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  similarServicePrice: {
    fontSize: 12,
  },
  bookNowContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  bookNowButton: {
    backgroundColor: '#4F46E5',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookNowText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  writeReviewButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  writeReviewText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
  noReviewsText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default BeautyServiceDetailScreen; 