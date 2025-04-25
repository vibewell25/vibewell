import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/unified-auth-context';
import { Feather } from '@expo/vector-icons';
import { View, Text, Button, ActivityIndicator, Alert } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import BeautyScreen from '../screens/BeautyScreen';
import BeautyServiceDetailScreen from '../screens/BeautyServiceDetailScreen';
import BeautyBookingScreen from '../screens/BeautyBookingScreen';
import BookingConfirmationScreen from '../screens/BookingConfirmationScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProviderListScreen from '../screens/ProviderListScreen';
import ProviderDetailScreen from '../screens/ProviderDetailScreen';
import ProviderFormScreen from '../screens/ProviderFormScreen';
import ServiceListScreen from '../screens/ServiceListScreen';
import ServiceDetailScreen from '../screens/ServiceDetailScreen';
import ServiceFormScreen from '../screens/ServiceFormScreen';
import BusinessProfileScreen from '../screens/BusinessProfileScreen';
import BusinessFormScreen from '../screens/BusinessFormScreen';
import BusinessHoursScreen from '../screens/BusinessHoursScreen';
import BusinessHourFormScreen from '../screens/BusinessHourFormScreen';
import StaffListScreen from '../screens/StaffListScreen';
import StaffFormScreen from '../screens/StaffFormScreen';
import TryOnScreen from '../screens/TryOnScreen';
import SkinAnalysisScreen from '../screens/SkinAnalysisScreen';
import SkinAnalysisResultScreen from '../screens/SkinAnalysisResultScreen';
import PaymentScreen from '../screens/PaymentScreen';
import LoyaltyTiersScreen from '../screens/LoyaltyTiersScreen';
import LoyaltyTransactionsScreen from '../screens/LoyaltyTransactionsScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import MembershipScreen from '../screens/MembershipScreen';
import ModelSelectionScreen from '../screens/ModelSelectionScreen';
import SubscriptionsScreen from '../screens/SubscriptionsScreen';
import ReferralScreen from '../screens/ReferralScreen';
import AnalyticsDashboardScreen from '../screens/AnalyticsDashboardScreen';
import { RootStackParamList } from '../types/navigation';
import { sendPushNotification } from '../services/push-notification';

// Placeholder screens until actual screens are created
const WellnessScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Wellness Screen</Text>
  </View>
);

const BookingsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Bookings Screen</Text>
  </View>
);

const CommunityScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Community Screen</Text>
  </View>
);

const ProfileScreen: React.FC = () => {
  const { user, isLoading, signOut } = useAuth();
  const handleTestPush = async () => {
    const success = await sendPushNotification(
      'Test Notification',
      'This is a test push notification'
    );
    Alert.alert(
      success ? 'Success' : 'Error',
      success ? 'Notification sent' : 'Failed to send notification'
    );
  };
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#2A9D8F" />
      ) : (
        <>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Profile</Text>
          <Text style={{ marginBottom: 8 }}>Name: {user?.name || 'N/A'}</Text>
          <Text style={{ marginBottom: 16 }}>Email: {user?.email}</Text>
          <Button title="Logout" onPress={signOut} color="#E63946" />
          <View style={{ marginTop: 12 }}>
            <Button title="Test Push Notification" onPress={handleTestPush} color="#2A9D8F" />
          </View>
        </>
      )}
    </View>
  );
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Stack navigator for Beauty screens
const BeautyStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BeautyMain" component={BeautyScreen} />
      <Stack.Screen name="BeautyServiceDetail" component={BeautyServiceDetailScreen} />
      <Stack.Screen name="BeautyBooking" component={BeautyBookingScreen} />
      <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
    </Stack.Navigator>
  );
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Wellness') {
            iconName = 'activity';
          } else if (route.name === 'Beauty') {
            iconName = 'scissors';
          } else if (route.name === 'Bookings') {
            iconName = 'calendar';
          } else if (route.name === 'Community') {
            iconName = 'users';
          } else if (route.name === 'SkinAnalysis') {
            iconName = 'image';
          } else if (route.name === 'Loyalty') {
            iconName = 'gift';
          } else if (route.name === 'LoyaltyTransactions') {
            iconName = 'list';
          } else if (route.name === 'PaymentMethods') {
            iconName = 'credit-card';
          } else if (route.name === 'Membership') {
            iconName = 'gift';
          } else if (route.name === 'Profile') {
            iconName = 'user';
          } else if (route.name === 'Subscriptions') {
            iconName = 'layers';
          } else if (route.name === 'Referral') {
            iconName = 'gift';
          } else if (route.name === 'Analytics') {
            iconName = 'bar-chart-2';
          }

          return <Feather name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Wellness" component={WellnessScreen} />
      <Tab.Screen name="Beauty" component={BeautyStack} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="SkinAnalysis" component={SkinAnalysisScreen} options={{ title: 'Skin Analysis' }} />
      <Tab.Screen name="Membership" component={MembershipScreen} options={{ title: 'Membership' }} />
      <Tab.Screen name="Loyalty" component={LoyaltyTiersScreen} options={{ title: 'Loyalty' }} />
      <Tab.Screen name="LoyaltyTransactions" component={LoyaltyTransactionsScreen} options={{ title: 'Transactions' }} />
      <Tab.Screen name="Referral" component={ReferralScreen} options={{ title: 'Referral' }} />
      <Tab.Screen name="PaymentMethods" component={PaymentMethodsScreen} options={{ title: 'Payments' }} />
      <Tab.Screen name="Subscriptions" component={SubscriptionsScreen} options={{ title: 'Subscriptions' }} />
      <Tab.Screen name="Analytics" component={AnalyticsDashboardScreen} options={{ title: 'Analytics' }} />
    </Tab.Navigator>
  );
};

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { isLoggedIn, isLoading } = useAuth();
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2A9D8F" />
      </View>
    );
  }
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
      <Stack.Screen name="ProviderList" component={ProviderListScreen} />
      <Stack.Screen name="ProviderDetail" component={ProviderDetailScreen} />
      <Stack.Screen name="ProviderForm" component={ProviderFormScreen} />
      <Stack.Screen name="ServiceList" component={ServiceListScreen} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <Stack.Screen name="ServiceForm" component={ServiceFormScreen} />
      <Stack.Screen name="BusinessProfile" component={BusinessProfileScreen} />
      <Stack.Screen name="BusinessForm" component={BusinessFormScreen} />
      <Stack.Screen name="BusinessHours" component={BusinessHoursScreen} />
      <Stack.Screen name="BusinessHourForm" component={BusinessHourFormScreen} />
      <Stack.Screen name="StaffList" component={StaffListScreen} />
      <Stack.Screen name="StaffForm" component={StaffFormScreen} />
      <Stack.Screen name="TryOn" component={TryOnScreen} />
      <Stack.Screen name="SkinAnalysis" component={SkinAnalysisScreen} />
      <Stack.Screen name="SkinAnalysisResult" component={SkinAnalysisResultScreen} />
      <Stack.Screen name="Membership" component={MembershipScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="ModelSelection" component={ModelSelectionScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;