import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RevenueAnalyticsScreen from '../screens/RevenueAnalyticsScreen';
import ClientAnalyticsScreen from '../screens/ClientAnalyticsScreen';
import ServiceUsageScreen from '../screens/ServiceUsageScreen';
import ChurnAnalyticsScreen from '../screens/ChurnAnalyticsScreen';

export type AnalyticsStackParamList = {
  RevenueAnalytics: undefined;
  ClientAnalytics: undefined;
  ServiceUsage: undefined;
  ChurnAnalytics: undefined;
const Stack = createStackNavigator<AnalyticsStackParamList>();

const AnalyticsStackNavigator: React.FC = () => (
  <Stack.Navigator>
    <Stack.Screen name="RevenueAnalytics" component={RevenueAnalyticsScreen} options={{ title: 'Revenue' }} />
    <Stack.Screen name="ClientAnalytics" component={ClientAnalyticsScreen} options={{ title: 'Clients' }} />
    <Stack.Screen name="ServiceUsage" component={ServiceUsageScreen} options={{ title: 'Service Usage' }} />
    <Stack.Screen name="ChurnAnalytics" component={ChurnAnalyticsScreen} options={{ title: 'Churn' }} />
  </Stack.Navigator>
export default AnalyticsStackNavigator;
