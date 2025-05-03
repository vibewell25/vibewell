import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  preferences: {
    notifications: boolean;
    marketing: boolean;
    darkMode: boolean;
  };
  stats: {
    bookings: number;
    reviews: number;
    favoriteServices: number;
  };
}

const ProfileScreen: React?.FC = () => {
  const { isDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      // In a real app, this would be an API call
      const savedProfile = await AsyncStorage?.getItem('@vibewell/user_profile');
      if (savedProfile) {
        setProfile(JSON?.parse(savedProfile));
      } else {
        // Mock data for demonstration
        const mockProfile: UserProfile = {
          id: user?.id || '1',
          name: user?.name || 'John Doe',
          email: user?.email || 'john@example?.com',
          preferences: {
            notifications: true,
            marketing: false,
            darkMode: isDarkMode
          },
          stats: {
            bookings: 5,
            reviews: 3,
            favoriteServices: 8
          }
        };
        setProfile(mockProfile);
        await AsyncStorage?.setItem('@vibewell/user_profile', JSON?.stringify(mockProfile));
      }
    } catch (error) {
      console?.error('Error loading profile:', error);
      Alert?.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      const permissionResult = await ImagePicker?.requestMediaLibraryPermissionsAsync();
      if (!permissionResult?.granted) {
        Alert?.alert('Permission Required', 'Please allow access to your photo library');
        return;
      }

      const result = await ImagePicker?.launchImageLibraryAsync({
        mediaTypes: ImagePicker?.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0?.8,
      });

      if (!result?.canceled && result?.assets[0] && profile) {
        setUploadingImage(true);
        try {
          // In a real app, upload image to server
          const updatedProfile: UserProfile = { ...profile, avatar: result?.assets[0].uri };
          setProfile(updatedProfile);
          await AsyncStorage?.setItem('@vibewell/user_profile', JSON?.stringify(updatedProfile));
        } catch (error) {
          console?.error('Error uploading image:', error);
          Alert?.alert('Error', 'Failed to update profile picture');
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error) {
      console?.error('Error picking image:', error);
      Alert?.alert('Error', 'Failed to select image');
    }
  };

  const handleLogout = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
    Alert?.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage?.clear();
              await logout();
            } catch (error) {
              console?.error('Error during logout:', error);
              Alert?.alert('Error', 'Failed to log out');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles?.container, styles?.centered]}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles?.container, { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles?.header}>
          <View style={styles?.avatarContainer}>
            {uploadingImage ? (
              <ActivityIndicator size="small" color="#4F46E5" />
            ) : (
              <TouchableOpacity onPress={handleImagePick}>
                {profile?.avatar ? (
                  <Image source={{ uri: profile?.avatar }} style={styles?.avatar} />
                ) : (
                  <View style={[styles?.avatar, styles?.placeholderAvatar]}>
                    <Feather name="user" size={40} color={isDarkMode ? '#FFFFFF' : '#666666'} />
                  </View>
                )}
                <View style={styles?.editIconContainer}>
                  <Feather name="edit-2" size={16} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles?.name, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            {profile?.name}
          </Text>
          <Text style={[styles?.email, { color: isDarkMode ? '#BBBBBB' : '#666666' }]}>
            {profile?.email}
          </Text>
        </View>

        {/* Stats */}
        <View style={[styles?.statsContainer, { backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5' }]}>
          <View style={styles?.statItem}>
            <Text style={[styles?.statNumber, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              {profile?.stats?.bookings}
            </Text>
            <Text style={[styles?.statLabel, { color: isDarkMode ? '#BBBBBB' : '#666666' }]}>
              Bookings
            </Text>
          </View>
          <View style={styles?.statItem}>
            <Text style={[styles?.statNumber, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              {profile?.stats?.reviews}
            </Text>
            <Text style={[styles?.statLabel, { color: isDarkMode ? '#BBBBBB' : '#666666' }]}>
              Reviews
            </Text>
          </View>
          <View style={styles?.statItem}>
            <Text style={[styles?.statNumber, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              {profile?.stats?.favoriteServices}
            </Text>
            <Text style={[styles?.statLabel, { color: isDarkMode ? '#BBBBBB' : '#666666' }]}>
              Favorites
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles?.section}>
          <Text style={[styles?.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            Account Settings
          </Text>
          <TouchableOpacity
            style={[styles?.actionItem, { backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5' }]}
            onPress={() => {/* Navigate to edit profile */}}
          >
            <Feather name="user" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
            <Text style={[styles?.actionText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              Edit Profile
            </Text>
            <Feather name="chevron-right" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles?.actionItem, { backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5' }]}
            onPress={() => {/* Navigate to payment methods */}}
          >
            <Feather name="credit-card" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
            <Text style={[styles?.actionText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              Payment Methods
            </Text>
            <Feather name="chevron-right" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles?.actionItem, { backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5' }]}
            onPress={() => {/* Navigate to notifications */}}
          >
            <Feather name="bell" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
            <Text style={[styles?.actionText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              Notifications
            </Text>
            <Feather name="chevron-right" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles?.section}>
          <Text style={[styles?.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            Support
          </Text>
          <TouchableOpacity
            style={[styles?.actionItem, { backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5' }]}
            onPress={() => {/* Navigate to help center */}}
          >
            <Feather name="help-circle" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
            <Text style={[styles?.actionText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              Help Center
            </Text>
            <Feather name="chevron-right" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles?.actionItem, { backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5' }]}
            onPress={() => {/* Navigate to privacy policy */}}
          >
            <Feather name="shield" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
            <Text style={[styles?.actionText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              Privacy Policy
            </Text>
            <Feather name="chevron-right" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles?.logoutButton, { backgroundColor: isDarkMode ? '#FF4444' : '#FFE5E5' }]}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={24} color={isDarkMode ? '#FFFFFF' : '#FF4444'} />
          <Text style={[
            styles?.logoutText,
            { color: isDarkMode ? '#FFFFFF' : '#FF4444' }
          ]}>
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet?.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderAvatar: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#4F46E5',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 