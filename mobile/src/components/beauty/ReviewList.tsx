import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Review } from '../../types/navigation';
import ReviewForm from './ReviewForm';

interface ReviewListProps {
  reviews: Review[];
  serviceId: string;
  isDarkMode: boolean;
  onReviewAdded: () => void;
}

const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  serviceId,
  isDarkMode,
  onReviewAdded
}) => {
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  // Rating distribution
  const ratingDistribution = [0, 0, 0, 0, 0]; // 5, 4, 3, 2, 1 stars
  reviews.forEach(review => {
    ratingDistribution[5 - review.rating]++;
  });

  // Get percentage for rating bar
  const getRatingPercentage = (count: number) => {
    if (reviews.length === 0) return 0;
    return (count / reviews.length) * 100;
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffDays = Math.floor(diff / (1000 * 3600 * 24));

    if (diffDays < 7) {
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays} days ago`;
    }

    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }

    return dateString;
  };

  // Render a review item
  const renderReviewItem = ({ item }: { item: Review }) => {
    return (
      <View
        style={[
          styles.reviewItem,
          { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }
        ]}
      >
        <View style={styles.reviewHeader}>
          <View style={styles.userInfo}>
            {item.userAvatar ? (
              <Image source={{ uri: item.userAvatar }} style={styles.userAvatar} />
            ) : (
              <View
                style={[
                  styles.userAvatarPlaceholder,
                  { backgroundColor: isDarkMode ? '#333333' : '#E0E0E0' }
                ]}
              >
                <Text style={styles.userInitial}>
                  {item.userName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View>
              <Text
                style={[
                  styles.userName,
                  { color: isDarkMode ? '#FFFFFF' : '#000000' }
                ]}
              >
                {item.userName}
              </Text>
              <Text
                style={[
                  styles.reviewDate,
                  { color: isDarkMode ? '#BBBBBB' : '#666666' }
                ]}
              >
                {formatDate(item.date)}
              </Text>
            </View>
          </View>
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, i) => (
              <Feather
                key={i}
                name="star"
                size={14}
                color={i < item.rating ? '#FFD700' : isDarkMode ? '#333333' : '#E0E0E0'}
                style={{ marginLeft: 2 }}
              />
            ))}
          </View>
        </View>
        <Text
          style={[
            styles.reviewComment,
            { color: isDarkMode ? '#E0E0E0' : '#333333' }
          ]}
        >
          {item.comment}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}
        >
          Reviews
        </Text>
        <TouchableOpacity
          style={[
            styles.writeReviewButton,
            { backgroundColor: isDarkMode ? '#333333' : '#F0F0F0' }
          ]}
          onPress={() => setShowReviewForm(true)}
        >
          <Feather
            name="edit-2"
            size={14}
            color={isDarkMode ? '#FFFFFF' : '#000000'}
            style={{ marginRight: 6 }}
          />
          <Text
            style={{
              color: isDarkMode ? '#FFFFFF' : '#000000',
              fontSize: 12,
              fontWeight: '500'
            }}
          >
            Write a Review
          </Text>
        </TouchableOpacity>
      </View>

      {reviews.length > 0 ? (
        <>
          <View style={styles.summaryContainer}>
            <View style={styles.averageRatingContainer}>
              <Text
                style={[
                  styles.averageRating,
                  { color: isDarkMode ? '#FFFFFF' : '#000000' }
                ]}
              >
                {averageRating}
              </Text>
              <View style={styles.starsRow}>
                {[...Array(5)].map((_, i) => (
                  <Feather
                    key={i}
                    name="star"
                    size={16}
                    color={i < Math.round(parseFloat(averageRating)) ? '#FFD700' : isDarkMode ? '#333333' : '#E0E0E0'}
                    style={{ marginHorizontal: 1 }}
                  />
                ))}
              </View>
              <Text
                style={[
                  styles.reviewCount,
                  { color: isDarkMode ? '#BBBBBB' : '#666666' }
                ]}
              >
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </Text>
            </View>

            <View style={styles.ratingBarsContainer}>
              {[5, 4, 3, 2, 1].map((rating) => (
                <View key={rating} style={styles.ratingBar}>
                  <Text
                    style={[
                      styles.ratingLabel,
                      { color: isDarkMode ? '#BBBBBB' : '#666666' }
                    ]}
                  >
                    {rating}
                  </Text>
                  <View
                    style={[
                      styles.ratingBarBackground,
                      { backgroundColor: isDarkMode ? '#333333' : '#E0E0E0' }
                    ]}
                  >
                    <View
                      style={[
                        styles.ratingBarFill,
                        {
                          width: `${getRatingPercentage(ratingDistribution[5 - rating])}%`,
                          backgroundColor: '#FFD700'
                        }
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.ratingCount,
                      { color: isDarkMode ? '#BBBBBB' : '#666666' }
                    ]}
                  >
                    {ratingDistribution[5 - rating]}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <FlatList
            data={reviews}
            renderItem={renderReviewItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            style={styles.reviewList}
          />
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Feather
            name="message-circle"
            size={50}
            color={isDarkMode ? '#333333' : '#E0E0E0'}
          />
          <Text
            style={[
              styles.emptyText,
              { color: isDarkMode ? '#BBBBBB' : '#666666' }
            ]}
          >
            No reviews yet. Be the first to review!
          </Text>
        </View>
      )}

      <ReviewForm
        serviceId={serviceId}
        isVisible={showReviewForm}
        onClose={() => setShowReviewForm(false)}
        onReviewAdded={onReviewAdded}
        isDarkMode={isDarkMode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  summaryContainer: {
    flexDirection: 'row',
    marginBottom: 20
  },
  averageRatingContainer: {
    alignItems: 'center',
    width: 100
  },
  averageRating: {
    fontSize: 36,
    fontWeight: 'bold'
  },
  starsRow: {
    flexDirection: 'row',
    marginVertical: 5
  },
  reviewCount: {
    fontSize: 12,
    marginTop: 4
  },
  ratingBarsContainer: {
    flex: 1,
    marginLeft: 15
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5
  },
  ratingLabel: {
    width: 15,
    fontSize: 12,
    marginRight: 5
  },
  ratingBarBackground: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden'
  },
  ratingBarFill: {
    height: '100%'
  },
  ratingCount: {
    width: 20,
    fontSize: 12,
    marginLeft: 5,
    textAlign: 'right'
  },
  reviewList: {
    marginTop: 10
  },
  reviewItem: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 10
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10
  },
  userAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  userInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666'
  },
  userName: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2
  },
  reviewDate: {
    fontSize: 12
  },
  ratingContainer: {
    flexDirection: 'row'
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center'
  }
});

export default ReviewList; 