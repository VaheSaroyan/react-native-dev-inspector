/**
 * NativeWind + Inspector Example - Root Layout
 * This demonstrates how to integrate react-native-dev-inspector with NativeWind
 * in an Expo Router project.
 */

import '../global.css';

import { Tabs } from 'expo-router';
import { Inspector, InspectorDevMenu } from 'react-native-dev-inspector';
import { View, Text } from 'react-native';

// Tab bar icon component
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    home: focused ? '[]' : '[]',
    components: focused ? '<>' : '<>',
    profile: focused ? '@' : '@',
  };

  return (
    <View className="items-center justify-center">
      <Text
        className={`text-lg font-mono ${
          focused ? 'text-indigo-600' : 'text-slate-400'
        }`}
      >
        {icons[name] || '?'}
      </Text>
    </View>
  );
}

export default function RootLayout() {
  return (
    <Inspector>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#4f46e5',
          tabBarInactiveTintColor: '#94a3b8',
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopColor: '#e2e8f0',
          },
          headerStyle: {
            backgroundColor: '#4f46e5',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
            headerTitle: 'NativeWind + Inspector',
          }}
        />
        <Tabs.Screen
          name="components"
          options={{
            title: 'Components',
            tabBarIcon: ({ focused }) => <TabIcon name="components" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
          }}
        />
      </Tabs>

      {/* Inspector floating button */}
      <InspectorDevMenu position="bottom-right" />
    </Inspector>
  );
}
