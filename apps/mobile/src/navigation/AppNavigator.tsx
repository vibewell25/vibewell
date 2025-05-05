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
import { BookingConfirmationScreen } from '../screens/BookingConfirmationScreen';
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
import AnalyticsStackNavigator from './AnalyticsStackNavigator';
import PromotionsScreen from '../screens/PromotionsScreen';
import EmailCampaignsScreen from '../screens/EmailCampaignsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import BookingListScreen from '../screens/BookingListScreen';
import BookingDetailScreen from '../screens/BookingDetailScreen';
import NewBookingScreen from '../screens/NewBookingScreen';
import StaffScheduleScreen from '../screens/StaffScheduleScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import TrainingModulesScreen from '../screens/TrainingModulesScreen';
import TrainingProgressScreen from '../screens/TrainingProgressScreen';
import CalendarScreen from '../screens/CalendarScreen';
import FormListScreen from '../screens/FormListScreen';
import FormDetailScreen from '../screens/FormDetailScreen';
import InventoryListScreen from '../screens/InventoryListScreen';
import InventoryDetailScreen from '../screens/InventoryDetailScreen';
import InventoryFormScreen from '../screens/InventoryFormScreen';
import EquipmentListScreen from '../screens/EquipmentListScreen';
import EquipmentDetailScreen from '../screens/EquipmentDetailScreen';
import EquipmentFormScreen from '../screens/EquipmentFormScreen';
import PostListScreen from '../screens/PostListScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import PostFormScreen from '../screens/PostFormScreen';
import EventListScreen from '../screens/EventListScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import EventFormScreen from '../screens/EventFormScreen';
import ThreadListScreen from '../screens/ThreadListScreen';
import ThreadDetailScreen from '../screens/ThreadDetailScreen';
import ThreadFormScreen from '../screens/ThreadFormScreen';
import { RootStackParamList } from '../types/navigation';
import { initPushNotifications } from '../services/push-notifications';

// Placeholder screens until actual screens are created
const WellnessScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Wellness Screen</Text>
  </View>
// Placeholder Payroll screens
const PayrollListScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Payroll List Screen</Text>
  </View>
const PayrollDetailScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Payroll Detail Screen</Text>
  </View>
const PayrollFormScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Payroll Form Screen</Text>
  </View>
const ProfileScreen: React.FC = () => {
  const { user, isLoading, signOut } = useAuth();
  
  const handleTestPush = async () => {
    try {
      const success = await initPushNotifications();
      Alert.alert(
        success ? 'Success' : 'Error',
        success ? 'Notification service initialized' : 'Failed to initialize notifications'
catch (error) {
      console.error('Error sending notification:', error);
      Alert.alert('Error', 'Failed to send notification');
return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#2A9D8F" />
      ) : (
        <>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Profile</Text>
          <Text style={{ marginBottom: 8 }}>Name: {user.name || 'N/A'}</Text>
          <Text style={{ marginBottom: 16 }}>Email: {user.email}</Text>
          <Button title="Logout" onPress={signOut} color="#E63946" />
          <View style={{ marginTop: 12 }}>
            <Button title="Test Push Notification" onPress={handleTestPush} color="#2A9D8F" />
          </View>
        </>
      )}
    </View>
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
// Community & Social stack navigator
const CommunityStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PostList" component={PostListScreen} options={{ title: 'Posts' }} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: 'Post' }} />
      <Stack.Screen name="PostForm" component={PostFormScreen} options={{ title: 'New Post' }} />
      <Stack.Screen name="ThreadList" component={ThreadListScreen} options={{ title: 'Threads' }} />
      <Stack.Screen name="ThreadDetail" component={ThreadDetailScreen} options={{ title: 'Thread' }} />
      <Stack.Screen name="ThreadForm" component={ThreadFormScreen} options={{ title: 'New Thread' }} />
      <Stack.Screen name="EventList" component={EventListScreen} options={{ title: 'Events' }} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Event' }} />
      <Stack.Screen name="EventForm" component={EventFormScreen} options={{ title: 'New Event' }} />
    </Stack.Navigator>
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
else if (route.name === 'Wellness') {
            iconName = 'activity';
else if (route.name === 'Beauty') {
            iconName = 'scissors';
else if (route.name === 'Bookings') {
            iconName = 'calendar';
else if (route.name === 'Community') {
            iconName = 'users';
else if (route.name === 'SkinAnalysis') {
            iconName = 'image';
else if (route.name === 'Loyalty') {
            iconName = 'gift';
else if (route.name === 'LoyaltyTransactions') {
            iconName = 'list';
else if (route.name === 'PaymentMethods') {
            iconName = 'credit-card';
else if (route.name === 'Membership') {
            iconName = 'gift';
else if (route.name === 'Subscriptions') {
            iconName = 'layers';
else if (route.name === 'Referral') {
            iconName = 'gift';
else if (route.name === 'Analytics') {
            iconName = 'bar-chart-2';
else if (route.name === 'Promotions') {
            iconName = 'tag';
else if (route.name === 'EmailCampaigns') {
            iconName = 'mail';
else if (route.name === 'Notifications') {
            iconName = 'bell';
else if (route.name === 'StaffSchedules') {
            iconName = 'calendar';
else if (route.name === 'Attendance') {
            iconName = 'check-square';
else if (route.name === 'TrainingModules') {
            iconName = 'book-open';
else if (route.name === 'TrainingProgress') {
            iconName = 'trending-up';
else if (route.name === 'Calendar') {
            iconName = 'calendar';
else if (route.name === 'FormList') {
            iconName = 'file-text';
else if (route.name === 'EquipmentList') {
            iconName = 'tool';
return <Feather name={iconName} size={size} color={color} />;
tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: 'gray',
)}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Wellness" component={WellnessScreen} />
      <Tab.Screen name="Beauty" component={BeautyStack} />
      <Tab.Screen name="Bookings" component={BookingListScreen} />
      <Tab.Screen name="Community" component={CommunityStack} options={{ title: 'Community' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="SkinAnalysis" component={SkinAnalysisScreen} options={{ title: 'Skin Analysis' }} />
      <Tab.Screen name="Membership" component={MembershipScreen} options={{ title: 'Membership' }} />
      <Tab.Screen name="Loyalty" component={LoyaltyTiersScreen} options={{ title: 'Loyalty' }} />
      <Tab.Screen name="LoyaltyTransactions" component={LoyaltyTransactionsScreen} options={{ title: 'Transactions' }} />
      <Tab.Screen name="Referral" component={ReferralScreen} options={{ title: 'Referral' }} />
      <Tab.Screen name="PaymentMethods" component={PaymentMethodsScreen} options={{ title: 'Payments' }} />
      <Tab.Screen name="Subscriptions" component={SubscriptionsScreen} options={{ title: 'Subscriptions' }} />
      <Tab.Screen name="Analytics" component={AnalyticsStackNavigator} options={{ title: 'Analytics' }} />
      <Tab.Screen name="Promotions" component={PromotionsScreen} options={{ title: 'Promotions' }} />
      <Tab.Screen name="EmailCampaigns" component={EmailCampaignsScreen} options={{ title: 'Email Campaigns' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Calendar' }} />
      <Tab.Screen name="FormList" component={FormListScreen} options={{ title: 'Forms' }} />
      <Tab.Screen name="StaffSchedules" component={StaffScheduleScreen} options={{ title: 'Schedules' }} />
      <Tab.Screen name="Attendance" component={AttendanceScreen} options={{ title: 'Attendance' }} />
      <Tab.Screen name="TrainingModules" component={TrainingModulesScreen} options={{ title: 'Modules' }} />
      <Tab.Screen name="TrainingProgress" component={TrainingProgressScreen} options={{ title: 'Progress' }} />
      <Tab.Screen name="EquipmentList" component={EquipmentListScreen} options={{ title: 'Equipment' }} />
    </Tab.Navigator>
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
const AppNavigator = () => {
  const { isLoggedIn, isLoading } = useAuth();
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2A9D8F" />
      </View>
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
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
      <Stack.Screen name="NewBooking" component={NewBookingScreen} />
      <Stack.Screen name="Calendar" component={CalendarScreen} />
      <Stack.Screen name="InventoryList" component={InventoryListScreen} />
      <Stack.Screen name="InventoryDetail" component={InventoryDetailScreen} />
      <Stack.Screen name="InventoryForm" component={InventoryFormScreen} />
      <Stack.Screen name="FormDetail" component={FormDetailScreen} />
      <Stack.Screen name="EquipmentList" component={EquipmentListScreen} />
      <Stack.Screen name="EquipmentDetail" component={EquipmentDetailScreen} />
      <Stack.Screen name="EquipmentForm" component={EquipmentFormScreen} />
      {/* Admin: Payroll */}
      <Stack.Screen name="PayrollList" component={PayrollListScreen} />
      <Stack.Screen name="PayrollDetail" component={PayrollDetailScreen} />
      <Stack.Screen name="PayrollForm" component={PayrollFormScreen} />
    </Stack.Navigator>
export default AppNavigator;