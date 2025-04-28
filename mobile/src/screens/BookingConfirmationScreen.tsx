import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Share,
  Dimensions,
  Linking,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  BookingConfirmationNavigationProp,
  BookingConfirmationRouteProp
} from '../types/navigation';
import { sendBookingConfirmation } from '../services/notificationService';
import { addBookingToCalendar, getCalendarPermissions, requestCalendarPermissions } from '../services/calendarService';
import { BookingResponse } from '../types/beauty';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, BookingConfirmationParams } from '../types/navigation';
import { theme } from '../styles/theme';

const { width } = Dimensions.get('window');

interface BookingConfirmationScreenProps {
  navigation: BookingConfirmationNavigationProp;
  route: BookingConfirmationRouteProp;
}

const BookingConfirmationScreen: React.FC<BookingConfirmationScreenProps> = ({
  navigation,
  route
}) => {
  const { isDarkMode } = useTheme();
  const { bookingId, serviceTitle, amount, date, time, status, serviceId, userInfo, duration, location, providerName } = route.params;
  
  const [isAddingToCalendar, setIsAddingToCalendar] = useState<boolean>(false);
  const [calendarAdded, setCalendarAdded] = useState<boolean>(false);
  const [notificationSent, setNotificationSent] = useState<boolean>(false);

  // Send confirmation notification when screen loads
  useEffect(() => {
    const sendConfirmation = async () => {
      if (notificationSent) return;
      
      try {
        // Create BookingResponse object
        const bookingData: BookingResponse = {
          bookingId,
          serviceId: serviceId || '',
          userId: userInfo?.email || 'user',
          serviceTitle,
          appointmentDate: `${date}T${time.replace(/\s/g, '')}`,
          duration: 60, // Default duration if not provided
          status: 'confirmed',
          price: amount,
          location: 'VibeWell Beauty Salon, 123 Main St',
          providerName: 'VibeWell Professional Staff',
          date,
          time,
          amount,
          userInfo,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const success = await sendBookingConfirmation(bookingData);
        if (success) {
          setNotificationSent(true);
          console.log('Booking confirmation notification sent');
        }
      } catch (error) {
        console.error('Error sending booking confirmation:', error);
      }
    };
    
    sendConfirmation();
  }, [bookingId, serviceTitle, amount, date, time, serviceId, userInfo, notificationSent]);

  // Share booking details
  const shareBooking = async () => {
    try {
      const message = `I've booked a "${serviceTitle}" appointment with VibeWell! Booking reference: ${bookingId}`;
      await Share.share({
        message,
        title: 'My VibeWell Booking',
      });
    } catch (error) {
      console.error('Error sharing booking:', error);
      Alert.alert('Error', 'Unable to share your booking details at this time.');
    }
  };
  
  // Add to calendar
  const addToCalendar = async () => {
    setIsAddingToCalendar(true);
    try {
      // Verify calendar permissions
      const hasPermission = await getCalendarPermissions();
      if (!hasPermission) {
        const granted = await requestCalendarPermissions();
        if (!granted) {
          setIsAddingToCalendar(false);
          Alert.alert(
            'Permission Required',
            'Calendar access is needed to add events. Please enable it in your device settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
          return;
        }
      }

      // Build booking event details
      const appointmentDateISO = new Date(`${date}T${time.replace(/\s/g, '')}`).toISOString();
      const bookingData: BookingResponse = {
        bookingId,
        userId: userInfo.email,
        serviceId,
        serviceTitle,
        appointmentDate: appointmentDateISO,
        duration,
        status,
        price: amount,
        location: location || '',
        providerName: providerName || '',
        date,
        time,
        amount,
        userInfo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Create calendar event
      const eventId = await addBookingToCalendar(bookingData);
      if (eventId) {
        setCalendarAdded(true);
        Alert.alert('Success', 'Your booking has been added to your calendar');
      }
    } catch (error: any) {
      console.error('Error adding to calendar:', error);
      Alert.alert('Error', error.message || 'Failed to add booking to calendar.');
    } finally {
      setIsAddingToCalendar(false);
    }
  };
  
  // Go back to home screen
  const goToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };
  
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      style={{ backgroundColor: isDarkMode ? '#121212' : '#F8F8F8' }}
    >
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={[
          styles.iconContainer,
          { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }
        ]}>
          <View style={styles.iconCircle}>
            <Feather name="check" size={50} color="#FFFFFF" />
          </View>
        </View>
        
        {/* Confirmation Message */}
        <Text style={[
          styles.title,
          { color: isDarkMode ? '#FFFFFF' : '#000000' }
        ]}>
          Booking Confirmed!
        </Text>
        
        <Text style={[
          styles.subtitle,
          { color: isDarkMode ? '#E0E0E0' : '#666666' }
        ]}>
          Your appointment for {serviceTitle} has been successfully booked. We've sent a confirmation to your email.
        </Text>
        
        {/* Booking Details */}
        <View style={[
          styles.bookingDetails,
          { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }
        ]}>
          <View style={styles.detailRow}>
            <Text style={[
              styles.detailLabel,
              { color: isDarkMode ? '#BBBBBB' : '#666666' }
            ]}>
              Booking Reference
            </Text>
            <Text style={[
              styles.detailValue,
              { color: isDarkMode ? '#FFFFFF' : '#000000' }
            ]}>
              {bookingId}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[
              styles.detailLabel,
              { color: isDarkMode ? '#BBBBBB' : '#666666' }
            ]}>
              Service
            </Text>
            <Text style={[
              styles.detailValue,
              { color: isDarkMode ? '#FFFFFF' : '#000000' }
            ]}>
              {serviceTitle}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[
              styles.detailLabel,
              { color: isDarkMode ? '#BBBBBB' : '#666666' }
            ]}>
              Status
            </Text>
            <View style={styles.statusContainer}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Confirmed</Text>
            </View>
          </View>
        </View>
        
        {/* Next Steps */}
        <View style={[
          styles.nextSteps,
          { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }
        ]}>
          <Text style={[
            styles.nextStepsTitle,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            What's Next?
          </Text>
          
          <View style={styles.stepItem}>
            <View style={[
              styles.stepNumber,
              { backgroundColor: isDarkMode ? '#2D3748' : '#E6F7FF' }
            ]}>
              <Text style={[
                styles.stepNumberText,
                { color: isDarkMode ? '#FFFFFF' : '#4F46E5' }
              ]}>1</Text>
            </View>
            <Text style={[
              styles.stepText,
              { color: isDarkMode ? '#E0E0E0' : '#444444' }
            ]}>
              You will receive a confirmation email with your booking details.
            </Text>
          </View>
          
          <View style={styles.stepItem}>
            <View style={[
              styles.stepNumber,
              { backgroundColor: isDarkMode ? '#2D3748' : '#E6F7FF' }
            ]}>
              <Text style={[
                styles.stepNumberText,
                { color: isDarkMode ? '#FFFFFF' : '#4F46E5' }
              ]}>2</Text>
            </View>
            <Text style={[
              styles.stepText,
              { color: isDarkMode ? '#E0E0E0' : '#444444' }
            ]}>
              Arrive 10 minutes before your appointment time.
            </Text>
          </View>
          
          <View style={styles.stepItem}>
            <View style={[
              styles.stepNumber,
              { backgroundColor: isDarkMode ? '#2D3748' : '#E6F7FF' }
            ]}>
              <Text style={[
                styles.stepNumberText,
                { color: isDarkMode ? '#FFFFFF' : '#4F46E5' }
              ]}>3</Text>
            </View>
            <Text style={[
              styles.stepText,
              { color: isDarkMode ? '#E0E0E0' : '#444444' }
            ]}>
              You can manage or reschedule your booking from your profile.
            </Text>
          </View>
          {notificationSent && (
            <View style={styles.stepItem}>
              <View style={[
                styles.stepNumber,
                { backgroundColor: isDarkMode ? '#2D3748' : '#E6F7FF' }
              ]}>
                <Text style={[
                  styles.stepNumberText,
                  { color: isDarkMode ? '#FFFFFF' : '#4F46E5' }
                ]}>4</Text>
              </View>
              <Text style={[
                styles.stepText,
                { color: isDarkMode ? '#E0E0E0' : '#444444' }
              ]}>
                Reminder notifications are scheduled 1 day and 1 hour before your appointment.
              </Text>
            </View>
          )}
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }
            ]}
            onPress={addToCalendar}
            disabled={isAddingToCalendar || calendarAdded}
          >
            {isAddingToCalendar ? (
              <ActivityIndicator size="small" color="#4F46E5" />
            ) : (
              <>
                <Feather 
                  name="calendar" 
                  size={20} 
                  color={calendarAdded ? '#4CAF50' : (isDarkMode ? '#FFFFFF' : '#000000')} 
                />
                <Text style={[
                  styles.actionButtonText,
                  { color: isDarkMode ? '#FFFFFF' : '#000000' }
                ]}>
                  {calendarAdded ? 'Added to Calendar' : 'Add to Calendar'}
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }
            ]}
            onPress={shareBooking}
          >
            <Feather name="share-2" size={20} color={isDarkMode ? '#FFFFFF' : '#000000'} />
            <Text style={[
              styles.actionButtonText,
              { color: isDarkMode ? '#FFFFFF' : '#000000' }
            ]}>
              Share Booking
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }
            ]}
            onPress={() => Linking.openURL('tel:+1234567890')}
          >
            <Feather name="phone" size={20} color={isDarkMode ? '#FFFFFF' : '#000000'} />
            <Text style={[
              styles.actionButtonText,
              { color: isDarkMode ? '#FFFFFF' : '#000000' }
            ]}>
              Contact Us
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={goToHome}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  bookingDetails: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 15,
  },
  nextSteps: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    width: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#4F46E5',
    borderRadius: 10,
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#4F46E5',
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'transparent',
  },
  doneButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BookingConfirmationScreen; 