import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  Keyboard,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { addServiceReview, ReviewInput } from '../../services/beautyService';
import { validateForm } from '../../utils/form-validation';

interface BeautyReviewFormProps {
  serviceId: string;
  onReviewAdded: () => void;
  isDarkMode: boolean;
}

const BeautyReviewForm: React.FC<BeautyReviewFormProps> = ({
  serviceId,
  onReviewAdded,
  isDarkMode
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingPress = (newRating: number) => {
    setRating(newRating);
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    
    const formData = {
      rating,
      comment: comment.trim(),
      name: name.trim()
    };
    
    const validationResult = validateForm(formData);
    
    // Add custom validation for rating
    if (rating === 0) {
      validationResult.errors.rating = 'Please select a rating';
      validationResult.isValid = false;
    }
    
    if (!validationResult.isValid) {
      const errorMessage = Object.values(validationResult.errors)[0];
      Alert.alert('Error', errorMessage);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const reviewData: ReviewInput = {
        serviceId,
        rating,
        comment: comment.trim(),
        userName: name.trim()
      };
      
      const success = await addServiceReview(reviewData);
      
      if (success) {
        // Clear the form
        setRating(0);
        setComment('');
        setName('');
        
        Alert.alert(
          'Thank You!', 
          'Your review has been submitted successfully',
          [{ text: 'OK', onPress: onReviewAdded }]
        );
      } else {
        Alert.alert('Error', 'There was a problem submitting your review. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'There was a problem submitting your review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (): JSX.Element[] => {
    const stars: JSX.Element[] = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleRatingPress(i)}
          style={styles.starButton}
        >
          <MaterialIcons
            name={i <= rating ? 'star' : 'star-outline'}
            size={32}
            color="#FFD700"
          />
        </TouchableOpacity>
      );
    }
    
    return stars;
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }
      ]}>
        <Text style={[
          styles.title,
          { color: isDarkMode ? '#FFFFFF' : '#000000' }
        ]}>
          Write a Review
        </Text>
        
        {/* Rating Stars */}
        <View style={styles.ratingContainer}>
          <Text style={[
            styles.label,
            { color: isDarkMode ? '#E0E0E0' : '#333333' }
          ]}>
            Your Rating
          </Text>
          <View style={styles.starsContainer}>
            {renderStars()}
          </View>
        </View>
        
        {/* Review Text */}
        <View style={styles.inputContainer}>
          <Text style={[
            styles.label,
            { color: isDarkMode ? '#E0E0E0' : '#333333' }
          ]}>
            Your Review
          </Text>
          <TextInput
            style={[
              styles.textArea,
              { 
                color: isDarkMode ? '#FFFFFF' : '#000000',
                backgroundColor: isDarkMode ? '#2A2A2A' : '#F7F7F7',
                borderColor: isDarkMode ? '#444444' : '#E0E0E0'
              }
            ]}
            placeholder="Share your experience with this service..."
            placeholderTextColor={isDarkMode ? '#BBBBBB' : '#AAAAAA'}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        
        {/* Name Field */}
        <View style={styles.inputContainer}>
          <Text style={[
            styles.label,
            { color: isDarkMode ? '#E0E0E0' : '#333333' }
          ]}>
            Your Name
          </Text>
          <TextInput
            style={[
              styles.input,
              { 
                color: isDarkMode ? '#FFFFFF' : '#000000',
                backgroundColor: isDarkMode ? '#2A2A2A' : '#F7F7F7',
                borderColor: isDarkMode ? '#444444' : '#E0E0E0'
              }
            ]}
            placeholder="Enter your name"
            placeholderTextColor={isDarkMode ? '#BBBBBB' : '#AAAAAA'}
            value={name}
            onChangeText={setName}
          />
        </View>
        
        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { opacity: isSubmitting ? 0.7 : 1 }
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 20,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  ratingContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    marginRight: 8,
    padding: 2,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 16,
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BeautyReviewForm; 