import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Image,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Review } from '../../types/navigation';

interface BeautyReviewsProps {
  reviews: Review[];
  serviceId: string;
  isDarkMode: boolean;
  onAddReview?: (review: Omit<Review, 'id'>) => Promise<void>;
}

const BeautyReviews = ({ reviews, serviceId, isDarkMode, onAddReview }: BeautyReviewsProps) => {
  const [showAddReview, setShowAddReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    if (!comment.trim()) {
      Alert.alert('Error', 'Please add a comment to your review');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (onAddReview) {
        await onAddReview({
          rating,
          comment,
          userName: 'You',
          date: new Date().toISOString(),
          userAvatar: 'https://ui-avatars.com/api/?name=You&background=4F46E5&color=fff'
        });
      }
      
      setShowAddReview(false);
      setRating(5);
      setComment('');
      Alert.alert('Success', 'Your review has been submitted!');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit your review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Feather
            key={star}
            name={star <= rating ? 'star' : 'star'}
            size={16}
            color={star <= rating ? '#FFD700' : isDarkMode ? '#555555' : '#DDDDDD'}
            style={styles.starIcon}
          />
        ))}
      </View>
    );
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={[
      styles.reviewItem,
      { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }
    ]}>
      <View style={styles.reviewHeader}>
        <Image
          source={{ uri: item.userAvatar || 'https://ui-avatars.com/api/?name=User&background=4F46E5&color=fff' }}
          style={styles.avatar}
        />
        <View style={styles.reviewHeaderText}>
          <Text style={[
            styles.userName, 
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            {item.userName}
          </Text>
          <Text style={[
            styles.reviewDate,
            { color: isDarkMode ? '#BBBBBB' : '#666666' }
          ]}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
        {renderStars(item.rating)}
      </View>
      <Text style={[
        styles.reviewComment,
        { color: isDarkMode ? '#DDDDDD' : '#333333' }
      ]}>
        {item.comment}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[
          styles.title,
          { color: isDarkMode ? '#FFFFFF' : '#000000' }
        ]}>
          Reviews ({reviews.length})
        </Text>
        <TouchableOpacity
          style={[
            styles.addButton,
            { backgroundColor: isDarkMode ? '#333333' : '#EEEEEE' }
          ]}
          onPress={() => setShowAddReview(true)}
        >
          <Feather name="plus" size={16} color={isDarkMode ? '#FFFFFF' : '#000000'} />
          <Text style={[
            styles.addButtonText,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            Add Review
          </Text>
        </TouchableOpacity>
      </View>

      {reviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="message-square" size={40} color={isDarkMode ? '#555555' : '#CCCCCC'} />
          <Text style={[
            styles.emptyText,
            { color: isDarkMode ? '#BBBBBB' : '#666666' }
          ]}>
            No reviews yet. Be the first to review!
          </Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          renderItem={renderReviewItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.reviewsList}
        />
      )}

      {/* Add Review Modal */}
      <Modal
        visible={showAddReview}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddReview(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[
            styles.modalContent,
            { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle,
                { color: isDarkMode ? '#FFFFFF' : '#000000' }
              ]}>
                Add Your Review
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddReview(false)}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
              </TouchableOpacity>
            </View>

            <View style={styles.ratingContainer}>
              <Text style={[
                styles.ratingLabel,
                { color: isDarkMode ? '#FFFFFF' : '#000000' }
              ]}>
                Your Rating
              </Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starButton}
                  >
                    <Feather
                      name="star"
                      size={32}
                      color={star <= rating ? '#FFD700' : isDarkMode ? '#555555' : '#DDDDDD'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.commentContainer}>
              <Text style={[
                styles.commentLabel,
                { color: isDarkMode ? '#FFFFFF' : '#000000' }
              ]}>
                Your Comment
              </Text>
              <TextInput
                style={[
                  styles.commentInput,
                  {
                    backgroundColor: isDarkMode ? '#333333' : '#F5F5F5',
                    color: isDarkMode ? '#FFFFFF' : '#000000',
                    borderColor: isDarkMode ? '#444444' : '#E0E0E0'
                  }
                ]}
                placeholder="What did you think about this service?"
                placeholderTextColor={isDarkMode ? '#AAAAAA' : '#999999'}
                multiline
                value={comment}
                onChangeText={setComment}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                { opacity: isSubmitting ? 0.7 : 1 }
              ]}
              onPress={handleSubmitReview}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  reviewsList: {
    paddingBottom: 10,
  },
  reviewItem: {
    marginBottom: 12,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  reviewHeaderText: {
    flex: 1,
  },
  userName: {
    fontWeight: '600',
    fontSize: 14,
  },
  reviewDate: {
    fontSize: 12,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  starIcon: {
    marginLeft: 2,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        paddingBottom: 40
      },
      android: {
        paddingBottom: 20
      }
    })
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  ratingContainer: {
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starButton: {
    padding: 5,
  },
  commentContainer: {
    marginBottom: 20,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  commentInput: {
    height: 120,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BeautyReviews; 