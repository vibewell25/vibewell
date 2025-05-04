import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  BeautyBookingNavigationProp,
  BeautyBookingRouteProp,
  BeautyServiceDetails
} from '../types/navigation';
import { createBooking, BookingRequest } from '../services/beautyService';
import { beautyApi } from '../services/api';
import { addBookingToCalendar } from '../services/calendarService';
import { Calendar } from 'react-native-calendars';

// Get current date and format it to YYYY-MM-DD
const getCurrentDate = (): string => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// Available date type
type AvailableDate = {
  id: string;
  date: Date;
  formattedDate: string;
  day: string;
  dateNum: number;
  month: string;
  fullDate: string;
};

// Available dates (next 7 days)
const getAvailableDates = (): AvailableDate[] => {
  const dates: AvailableDate[] = [];
  const today = new Date();
  
  for (let i = 0; i < 7; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    dates.push({
      id: i.toString(),
      date: date,
      formattedDate: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      fullDate: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    });
  }
  
  return dates;
};

const BeautyBookingScreen: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user, isLoggedIn } = useAuth();
  const navigation = useNavigation<BeautyBookingNavigationProp>();
  const route = useRoute<BeautyBookingRouteProp>();
  const { service } = route.params;
  
  // State variables for booking form
  const [selectedDate, setSelectedDate] = useState<string>(getAvailableDates()[0].id);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [timeSlots, setTimeSlots] = useState<{id:string;time:string;available:boolean}[]>(service.availability.timeSlots || []);
  const [availabilityLoading, setAvailabilityLoading] = useState<boolean>(false);
  
  // Customer info (if not logged in)
  const [name, setName] = useState<string>(user.name || '');
  const [email, setEmail] = useState<string>(user.email || '');
  const [phone, setPhone] = useState<string>('');
  
  // Get the selected date object
  const getSelectedDateObj = () => {
    return getAvailableDates().find(date => date.id === selectedDate);
  };
  
  // Handle booking submission
  const handleBookingSubmit = async () => {
    // Validate form
    if (!selectedTimeSlot) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }
    
    if (!isLoggedIn && (!name || !email || !phone)) {
      Alert.alert('Error', 'Please fill in all customer information fields');
      return;
    }
    
    // Show loading indicator
    setIsSubmitting(true);
    
    try {
      // Get the selected time slot
      const timeSlot = timeSlots.find(slot => slot.id === selectedTimeSlot);
      if (!timeSlot) {
        Alert.alert('Error', 'Selected time slot not available');
        setIsSubmitting(false);
        return;
      }
      
      // Get the selected date in YYYY-MM-DD format
      const selectedDateObj = getSelectedDateObj();
      if (!selectedDateObj) {
        Alert.alert('Error', 'Selected date not available');
        setIsSubmitting(false);
        return;
      }
      
      // Build booking request
      const bookingRequest: BookingRequest = {
        serviceId: service.id,
        date: selectedDateObj.formattedDate,
        timeSlot: { id: timeSlot.id, time: timeSlot.time },
        userInfo: isLoggedIn
          ? { name: user.name || '', email: user.email || '', phone }
          : { name, email, phone },
        specialRequests,
      };
      // Execute booking
      const bookingResponse = await createBooking(bookingRequest);
      // Auto-add booking to device calendar
      try { await addBookingToCalendar(bookingResponse); } catch (err) { console.error('Calendar add failed', err); }
      // Navigate to confirmation
      navigation.navigate('BookingConfirmation', {
        bookingId: bookingResponse.bookingId,
        serviceId: bookingResponse.serviceId,
        serviceTitle: service.title,
        date: bookingRequest.date,
        time: bookingRequest.timeSlot.time,
        status: bookingResponse.status,
        amount: bookingResponse.price,
        duration: bookingResponse.duration,
        location: bookingResponse.location,
        providerName: bookingResponse.providerName,
        userInfo: bookingRequest.userInfo,
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get formatted price
  const getFormattedPrice = (price: number) => {
    const strPrice = price.toString();
    return strPrice.includes('+') ? `From ${strPrice}` : strPrice;
  };
  
  // Fetch real-time availability when date changes
  useEffect(() => {
    const fetchAvailability = async () => {
      setAvailabilityLoading(true);
      try {
        const formatted = getSelectedDateObj().formattedDate;
        if (formatted) {
          const slots = await beautyApi.checkAvailability(service.id, formatted);
          setTimeSlots(slots);
        }
      } catch (err) {
        console.error('Error fetching availability:', err);
      } finally {
        setAvailabilityLoading(false);
      }
    };
    fetchAvailability();
    // Clear previous time selection when date changes
    setSelectedTimeSlot('');
  }, [selectedDate]);
  
  // Build markedDates for calendar
  const availableDates = service.availability.dates || [];
  const markedDates = availableDates.reduce<Record<string, any>>((acc, date) => {
    acc[date] = {
      disabled: false,
      selected: date === selectedDate,
      selectedColor: isDarkMode ? '#4F46E5' : '#4F46E5',
    };
    return acc;
  }, {});

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#121212' : '#F8F8F8' }
      ]}
    >
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
        <Text style={[
          styles.headerTitle,
          { color: isDarkMode ? '#FFFFFF' : '#000000' }
        ]}>
          Book Appointment
        </Text>
        <View style={{ width: 24 }} />
      </View>
      
      {/* Service Summary */}
      <View style={[
        styles.serviceSummary,
        { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }
      ]}>
        <Text style={[
          styles.serviceName,
          { color: isDarkMode ? '#FFFFFF' : '#000000' }
        ]}>
          {service.title}
        </Text>
        <View style={styles.serviceDetails}>
          <Text style={[
            styles.serviceDetail,
            { color: isDarkMode ? '#E0E0E0' : '#666666' }
          ]}>
            <Feather name="clock" size={14} color={isDarkMode ? '#BBBBBB' : '#666666'} /> {service.duration}
          </Text>
          <Text style={[
            styles.serviceDetail,
            { color: isDarkMode ? '#E0E0E0' : '#666666' }
          ]}>
            <Feather name="tag" size={14} color={isDarkMode ? '#BBBBBB' : '#666666'} /> {getFormattedPrice(service.price)}
          </Text>
        </View>
        <View style={styles.providerRow}>
          <Text style={[
            styles.serviceProvider,
            { color: isDarkMode ? '#BBBBBB' : '#666666' }
          ]}>
            Provider ID: {service.providerId}
          </Text>
          <View style={styles.ratingContainer}>
            <Feather name="star" size={12} color="#FFD700" />
            <Text style={[
              styles.ratingText,
              { color: isDarkMode ? '#FFFFFF' : '#000000' }
            ]}>
              {service.rating.toFixed(1)} ({service.reviews.length})
            </Text>
          </View>
        </View>
      </View>
      
      {/* Date Selection (Calendar) */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Select Date</Text>
        <Calendar
          current={selectedDate}
          minDate={getCurrentDate()}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          theme={{
            dayTextColor: isDarkMode ? '#FFFFFF' : '#000000',
            monthTextColor: isDarkMode ? '#FFFFFF' : '#000000',
            textDisabledColor: '#AAAAAA',
            selectedDayBackgroundColor: '#4F46E5',
          }}
        />
      </View>
      
      {/* Time Selection */}
      <View style={styles.section}>
        <Text style={[
          styles.sectionTitle,
          { color: isDarkMode ? '#FFFFFF' : '#000000' }
        ]}>
          Select Time
        </Text>
        {availabilityLoading ? (
          <ActivityIndicator size="large" style={{ marginVertical: 20 }} />
        ) : timeSlots.length === 0 ? (
          <Text style={{ textAlign: 'center', marginVertical: 16, color: isDarkMode ? '#FFFFFF' : '#000000' }}>
            No available time slots for this date.
          </Text>
        ) : (
          <View style={styles.timeGrid}>
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.timeSlot,
                  {
                    backgroundColor: !slot.available
                      ? (isDarkMode ? '#2A2A2A' : '#F0F0F0')
                      : selectedTimeSlot === slot.id
                        ? (isDarkMode ? '#4F46E5' : '#4F46E5')
                        : (isDarkMode ? '#1E1E1E' : '#FFFFFF')
                  }
                ]}
                disabled={!slot.available}
                onPress={() => setSelectedTimeSlot(slot.id)}
              >
                <Text style={[
                  styles.timeText,
                  {
                    color: !slot.available
                      ? (isDarkMode ? '#555555' : '#AAAAAA')
                      : selectedTimeSlot === slot.id
                        ? '#FFFFFF'
                        : (isDarkMode ? '#FFFFFF' : '#000000')
                  }
                ]}>
                  {slot.time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      
      {/* Customer Information (if not logged in) */}
      {!isLoggedIn && (
        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            Your Information
          </Text>
          <View style={styles.formGroup}>
            <Text style={[
              styles.label,
              { color: isDarkMode ? '#BBBBBB' : '#666666' }
            ]}>
              Full Name
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? '#2A2A2A' : '#FFFFFF',
                  color: isDarkMode ? '#FFFFFF' : '#000000',
                  borderColor: isDarkMode ? '#333333' : '#E0E0E0'
                }
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor={isDarkMode ? '#777777' : '#AAAAAA'}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={[
              styles.label,
              { color: isDarkMode ? '#BBBBBB' : '#666666' }
            ]}>
              Email
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? '#2A2A2A' : '#FFFFFF',
                  color: isDarkMode ? '#FFFFFF' : '#000000',
                  borderColor: isDarkMode ? '#333333' : '#E0E0E0'
                }
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={isDarkMode ? '#777777' : '#AAAAAA'}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={[
              styles.label,
              { color: isDarkMode ? '#BBBBBB' : '#666666' }
            ]}>
              Phone Number
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? '#2A2A2A' : '#FFFFFF',
                  color: isDarkMode ? '#FFFFFF' : '#000000',
                  borderColor: isDarkMode ? '#333333' : '#E0E0E0'
                }
              ]}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              placeholderTextColor={isDarkMode ? '#777777' : '#AAAAAA'}
              keyboardType="phone-pad"
            />
          </View>
        </View>
      )}
      
      {/* Special Requests */}
      <View style={styles.section}>
        <Text style={[
          styles.sectionTitle,
          { color: isDarkMode ? '#FFFFFF' : '#000000' }
        ]}>
          Special Requests (Optional)
        </Text>
        <TextInput
          style={[
            styles.textarea,
            {
              backgroundColor: isDarkMode ? '#2A2A2A' : '#FFFFFF',
              color: isDarkMode ? '#FFFFFF' : '#000000',
              borderColor: isDarkMode ? '#333333' : '#E0E0E0'
            }
          ]}
          value={specialRequests}
          onChangeText={setSpecialRequests}
          placeholder="Any special requests or notes for your appointment"
          placeholderTextColor={isDarkMode ? '#777777' : '#AAAAAA'}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
      
      {/* Booking Summary */}
      <View style={[
        styles.bookingSummary,
        { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }
      ]}>
        <View style={styles.summaryRow}>
          <Text style={[
            styles.summaryLabel,
            { color: isDarkMode ? '#BBBBBB' : '#666666' }
          ]}>
            Service
          </Text>
          <Text style={[
            styles.summaryValue,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            {service.title}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[
            styles.summaryLabel,
            { color: isDarkMode ? '#BBBBBB' : '#666666' }
          ]}>
            Date
          </Text>
          <Text style={[
            styles.summaryValue,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            {selectedDate}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[
            styles.summaryLabel,
            { color: isDarkMode ? '#BBBBBB' : '#666666' }
          ]}>
            Time
          </Text>
          <Text style={[
            styles.summaryValue,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            {selectedTimeSlot ? timeSlots.find(slot => slot.id === selectedTimeSlot).time : 'Not selected'}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[
            styles.summaryLabel,
            { color: isDarkMode ? '#BBBBBB' : '#666666' }
          ]}>
            Price
          </Text>
          <Text style={[
            styles.summaryValue,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            {getFormattedPrice(service.price)}
          </Text>
        </View>
      </View>
      
      {/* Book Now Button */}
      <TouchableOpacity
        style={[
          styles.bookButton,
          { opacity: isSubmitting ? 0.7 : 1 }
        ]}
        onPress={handleBookingSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.bookButtonText}>Book Now</Text>
        )}
      </TouchableOpacity>
      
      {/* Terms and Privacy */}
      <Text style={[
        styles.termsText,
        { color: isDarkMode ? '#BBBBBB' : '#666666' }
      ]}>
        By booking this service, you agree to our {' '}
        <Text style={{ color: isDarkMode ? '#4F46E5' : '#4F46E5' }}>
          Terms of Service
        </Text> and {' '}
        <Text style={{ color: isDarkMode ? '#4F46E5' : '#4F46E5' }}>
          Privacy Policy
        </Text>
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  serviceSummary: {
    margin: 15,
    padding: 15,
    borderRadius: 10,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  serviceDetails: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  serviceDetail: {
    fontSize: 14,
    marginRight: 15,
  },
  providerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceProvider: {
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  section: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    width: '31%',
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeText: {
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    minHeight: 100,
  },
  bookingSummary: {
    margin: 15,
    padding: 15,
    borderRadius: 10,
    marginTop: 0,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  bookButton: {
    backgroundColor: '#4F46E5',
    marginHorizontal: 15,
    marginVertical: 20,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 30,
    lineHeight: 18,
  },
});

export default BeautyBookingScreen; 