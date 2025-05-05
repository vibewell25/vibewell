import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { Review } from '../../types/navigation';
import { formatDistanceToNow } from 'date-fns';

interface BeautyReviewCardProps {
  review: Review;
  onLike?: () => void;
  onReport?: () => void;
  isDarkMode: boolean;
const BeautyReviewCard: React.FC<BeautyReviewCardProps> = ({
  review,
  onLike,
  onReport,
  isDarkMode
) => {
  // Format date to relative time (e.g., "2 days ago")
  const formattedDate = formatDistanceToNow(new Date(review.date), { addSuffix: true });

  // Generate star rating display
  const renderStars = (): JSX.Element[] => {
    const stars: JSX.Element[] = [];
    const rating = review.rating;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
      stars.push(
        <MaterialIcons 
          key={`star-${i}`} 
          name="star" 
          size={16} 
          color="#FFD700" 
          style={styles.star}
        />
// Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <MaterialIcons 
          key="half-star" 
          name="star-half" 
          size={16} 
          color="#FFD700" 
          style={styles.star}
        />
// Add empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
      stars.push(
        <MaterialIcons 
          key={`empty-star-${i}`} 
          name="star-outline" 
          size={16} 
          color="#FFD700" 
          style={styles.star}
        />
return stars;
return (
    <View style={[
      styles.container,
      { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }
    ]}>
      {/* Header with user info */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {review.userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.nameAndDate}>
            <Text style={[
              styles.userName,
              { color: isDarkMode ? '#FFFFFF' : '#000000' }
            ]}>
              {review.userName}
            </Text>
            <Text style={[
              styles.date,
              { color: isDarkMode ? '#BBBBBB' : '#666666' }
            ]}>
              {formattedDate}
            </Text>
          </View>
        </View>
        <View style={styles.rating}>
          {renderStars()}
          <Text style={[
            styles.ratingText,
            { color: isDarkMode ? '#FFFFFF' : '#000000' }
          ]}>
            {review.rating.toFixed(1)}
          </Text>
        </View>
      </View>

      {/* Review content */}
      <Text style={[
        styles.comment,
        { color: isDarkMode ? '#E0E0E0' : '#333333' }
      ]}>
        {review.comment}
      </Text>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={onLike}
        >
          <Feather 
            name="thumbs-up" 
            size={16} 
            color={isDarkMode ? '#BBBBBB' : '#666666'} 
          />
          <Text style={[
            styles.actionText,
            { color: isDarkMode ? '#BBBBBB' : '#666666' }
          ]}>
            Helpful
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={onReport}
        >
          <Feather 
            name="flag" 
            size={16} 
            color={isDarkMode ? '#BBBBBB' : '#666666'} 
          />
          <Text style={[
            styles.actionText,
            { color: isDarkMode ? '#BBBBBB' : '#666666' }
          ]}>
            Report
          </Text>
        </TouchableOpacity>
      </View>
    </View>
const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
nameAndDate: {
    flexDirection: 'column',
userName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
date: {
    fontSize: 12,
rating: {
    flexDirection: 'row',
    alignItems: 'center',
star: {
    marginLeft: 2,
ratingText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: 'bold',
comment: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
actionText: {
    fontSize: 14,
    marginLeft: 6,
export default BeautyReviewCard; 