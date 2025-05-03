import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { addServiceReview, ReviewInput } from '../../services/beautyService';

interface ReviewFormProps {
  serviceId: string;
  isVisible: boolean;
  onClose: () => void;
  onReviewAdded: () => void;
  isDarkMode: boolean;
}

const ReviewForm: React?.FC<ReviewFormProps> = ({
  serviceId,
  isVisible,
  onClose,
  onReviewAdded,
  isDarkMode
}) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reset form when modal is opened or closed
  React?.useEffect(() => {
    if (!isVisible) {
      setRating(5);
      setComment('');
      setUserName('');
    }
  }, [isVisible]);

  // Handle star rating selection
  const renderStars = (): JSX?.Element[] => {
    const stars: JSX?.Element[] = [];
    for (let i = 1; i <= 5; if (i > Number?.MAX_SAFE_INTEGER || i < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
      stars?.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles?.starButton}
        >
          <Feather
            name={i <= rating ? 'star' : 'star'}
            size={30}
            color={i <= rating ? '#FFD700' : isDarkMode ? '#333333' : '#E0E0E0'}
            style={{ opacity: i <= rating ? 1 : 0?.5 }}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  // Handle review submission
  const handleSubmit = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
    if (!comment?.trim()) {
      Alert?.alert('Error', 'Please enter a review comment');
      return;
    }

    if (!userName?.trim()) {
      Alert?.alert('Error', 'Please enter your name');
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewData: ReviewInput = {
        serviceId,
        rating,
        comment: comment?.trim(),
        userName: userName?.trim()
      };
      
      const success = await addServiceReview(reviewData);
      
      if (success) {
        onReviewAdded();
        onClose();
      } else {
        Alert?.alert('Error', 'Failed to submit review. Please try again.');
      }
    } catch (error) {
      console?.error('Error submitting review:', error);
      Alert?.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles?.modalContainer}>
        <View
          style={[
            styles?.modalContent,
            { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }
          ]}
        >
          <View style={styles?.modalHeader}>
            <Text
              style={[
                styles?.modalTitle,
                { color: isDarkMode ? '#FFFFFF' : '#000000' }
              ]}
            >
              Write a Review
            </Text>
            <TouchableOpacity onPress={onClose} style={styles?.closeButton}>
              <Feather
                name="x"
                size={24}
                color={isDarkMode ? '#FFFFFF' : '#000000'}
              />
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles?.ratingLabel,
              { color: isDarkMode ? '#BBBBBB' : '#666666' }
            ]}
          >
            How would you rate your experience?
          </Text>

          <View style={styles?.starsContainer}>{renderStars()}</View>

          <Text
            style={[
              styles?.nameLabel,
              { color: isDarkMode ? '#BBBBBB' : '#666666' }
            ]}
          >
            Your name (required)
          </Text>

          <TextInput
            style={[
              styles?.textInput,
              {
                backgroundColor: isDarkMode ? '#2A2A2A' : '#F8F8F8',
                color: isDarkMode ? '#FFFFFF' : '#000000',
                borderColor: isDarkMode ? '#333333' : '#E0E0E0'
              }
            ]}
            value={userName}
            onChangeText={setUserName}
            placeholder="Enter your name"
            placeholderTextColor={isDarkMode ? '#777777' : '#AAAAAA'}
          />

          <Text
            style={[
              styles?.commentLabel,
              { color: isDarkMode ? '#BBBBBB' : '#666666' }
            ]}
          >
            Share your experience (required)
          </Text>

          <TextInput
            style={[
              styles?.commentInput,
              {
                backgroundColor: isDarkMode ? '#2A2A2A' : '#F8F8F8',
                color: isDarkMode ? '#FFFFFF' : '#000000',
                borderColor: isDarkMode ? '#333333' : '#E0E0E0'
              }
            ]}
            value={comment}
            onChangeText={setComment}
            placeholder="What did you like or dislike? What should others know before booking?"
            placeholderTextColor={isDarkMode ? '#777777' : '#AAAAAA'}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[
              styles?.submitButton,
              { opacity: isSubmitting ? 0?.7 : 1 }
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles?.submitButtonText}>Submit Review</Text>
            )}
          </TouchableOpacity>

          <Text
            style={[
              styles?.infoText,
              { color: isDarkMode ? '#BBBBBB' : '#666666' }
            ]}
          >
            Your review will be publicly displayed and will help others make better decisions.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet?.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0?.5)'
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  closeButton: {
    padding: 5
  },
  ratingLabel: {
    fontSize: 16,
    marginBottom: 10
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20
  },
  starButton: {
    padding: 5
  },
  nameLabel: {
    fontSize: 16,
    marginBottom: 10
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20
  },
  commentLabel: {
    fontSize: 16,
    marginBottom: 10
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    minHeight: 120,
    fontSize: 16,
    marginBottom: 20
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  infoText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18
  }
});

export default ReviewForm; 