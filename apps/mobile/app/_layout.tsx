import { Tabs } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const backgroundColor = isDark ? '#121212' : '#f4f4f8';
  const tintColor = '#6200ee';
  const tabBarBgColor = isDark ? '#1e1e1e' : '#ffffff';
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Tabs
          screenOptions={{
            headerStyle: {
              backgroundColor: backgroundColor,
            },
            headerTintColor: tintColor,
            tabBarActiveTintColor: tintColor,
            tabBarInactiveTintColor: isDark ? '#999999' : '#666666',
            tabBarStyle: {
              backgroundColor: tabBarBgColor,
            },
            contentStyle: {
              backgroundColor: backgroundColor,
            },
          }}
        >
          <Tabs.Screen 
            name="index" 
            options={{
              title: 'Home',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
            }} 
          />
          <Tabs.Screen 
            name="beauty" 
            options={{
              title: 'Beauty',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="heart" size={size} color={color} />
              ),
            }} 
          />
          <Tabs.Screen 
            name="wellness" 
            options={{
              title: 'Wellness',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="fitness" size={size} color={color} />
              ),
            }} 
          />
          <Tabs.Screen 
            name="bookings" 
            options={{
              title: 'Bookings',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="calendar" size={size} color={color} />
              ),
            }} 
          />
          <Tabs.Screen 
            name="profile" 
            options={{
              title: 'Profile',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person" size={size} color={color} />
              ),
            }} 
          />
        </Tabs>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
