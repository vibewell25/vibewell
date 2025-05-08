import React from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const profileSections = [
  {
    title: 'Account',
    items: [
      { id: 'edit-profile', name: 'Edit Profile', icon: 'person-outline', route: '/profile/edit' },
      { id: 'security', name: 'Security', icon: 'shield-outline', route: '/profile/security' },
      { id: 'notifications', name: 'Notifications', icon: 'notifications-outline', route: '/profile/notifications' },
      { id: 'payment-methods', name: 'Payment Methods', icon: 'card-outline', route: '/profile/payment-methods' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { id: 'appearance', name: 'Appearance', icon: 'color-palette-outline', route: '/profile/appearance' },
      { id: 'language', name: 'Language', icon: 'language-outline', route: '/profile/language' },
      { id: 'privacy', name: 'Privacy Settings', icon: 'lock-closed-outline', route: '/profile/privacy' },
    ],
  },
  {
    title: 'Support',
    items: [
      { id: 'help', name: 'Help Center', icon: 'help-circle-outline', route: '/profile/help' },
      { id: 'feedback', name: 'Send Feedback', icon: 'chatbox-outline', route: '/profile/feedback' },
      { id: 'terms', name: 'Terms of Service', icon: 'document-text-outline', route: '/profile/terms' },
      { id: 'privacy-policy', name: 'Privacy Policy', icon: 'document-outline', route: '/profile/privacy-policy' },
    ],
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  
  // Mock user data
  const user = {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    memberSince: 'June 2022',
    loyaltyPoints: 850,
  };

  const handleItemPress = (route: string) => {
    router.push(route);
  };

  const handleLogout = () => {
    // Implement logout functionality
    router.replace('/');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: user.avatar }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.memberInfo}>
          <Text style={styles.memberText}>Member since {user.memberSince}</Text>
          <View style={styles.loyaltyContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.loyaltyText}>{user.loyaltyPoints} points</Text>
          </View>
        </View>
      </View>

      {profileSections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleItemPress(item.route)}
            >
              <View style={styles.menuItemContent}>
                <Ionicons name={item.icon} size={22} color="#6200ee" />
                <Text style={styles.menuItemText}>{item.name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8fa',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberText: {
    fontSize: 12,
    color: '#666',
    marginRight: 16,
  },
  loyaltyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loyaltyText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 16,
  },
  versionContainer: {
    alignItems: 'center',
    padding: 16,
    marginBottom: 24,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
}); 