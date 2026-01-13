/**
 * Home Screen - NativeWind Inspector Example
 * Demonstrates various NativeWind styled components with the inspector
 */

import { ScrollView, View, Text, useColorScheme } from 'react-native';

// Feature card component with NativeWind
function Card({
  title,
  description,
  variant = 'default',
}: {
  title: string;
  description: string;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}) {
  const variantClasses = {
    default: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    primary: 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800',
    success: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800',
  };

  return (
    <View className={`rounded-xl p-4 mb-3 border ${variantClasses[variant]} shadow-sm`}>
      <Text className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">
        {title}
      </Text>
      <Text className="text-sm text-slate-600 dark:text-slate-400">
        {description}
      </Text>
    </View>
  );
}

// Stats card component
function StatsCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
}) {
  const trendColors = {
    up: 'text-emerald-600 dark:text-emerald-400',
    down: 'text-rose-600 dark:text-rose-400',
    neutral: 'text-slate-500 dark:text-slate-400',
  };

  const trendIcons = {
    up: '+12%',
    down: '-5%',
    neutral: '~0%',
  };

  return (
    <View className="bg-white dark:bg-slate-800 rounded-xl p-4 flex-1 mx-1 shadow-sm">
      <Text className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}
      </Text>
      <Text className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
        {value}
      </Text>
      <Text className={`text-xs mt-1 ${trendColors[trend]}`}>
        {trendIcons[trend]} from last week
      </Text>
    </View>
  );
}

// Nested component example
function NestedExample() {
  return (
    <View className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
      <Text className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3">
        Nested Components
      </Text>
      <View className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3 border-l-4 border-indigo-500">
        <Text className="text-sm text-slate-700 dark:text-slate-300">Level 1</Text>
        <View className="bg-slate-200 dark:bg-slate-600 rounded-lg p-3 mt-2 border-l-4 border-purple-500">
          <Text className="text-sm text-slate-700 dark:text-slate-300">Level 2</Text>
          <View className="bg-slate-300 dark:bg-slate-500 rounded-lg p-3 mt-2 border-l-4 border-pink-500">
            <Text className="text-sm text-slate-800 dark:text-slate-200 font-medium">
              Level 3 - Try inspecting me!
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <ScrollView className={`flex-1 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
      <View className="p-4">
        {/* Hero Section */}
        <View className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 mb-6">
          <Text className="text-white text-xl font-bold mb-2">
            Welcome to NativeWind
          </Text>
          <Text className="text-indigo-100 text-sm">
            Use Tailwind CSS classes directly in your React Native app.
            Tap the inspector button to inspect any component!
          </Text>
        </View>

        {/* Stats Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
            Quick Stats
          </Text>
          <View className="flex-row mx-[-4px]">
            <StatsCard label="Views" value="2.4k" trend="up" />
            <StatsCard label="Clicks" value="847" trend="up" />
            <StatsCard label="Bounce" value="12%" trend="down" />
          </View>
        </View>

        {/* Features Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
            Features
          </Text>
          <Card
            title="NativeWind Integration"
            description="Use Tailwind CSS classes directly in React Native components"
            variant="primary"
          />
          <Card
            title="Click to Inspect"
            description="Tap any component to see its source file and line number"
            variant="success"
          />
          <Card
            title="Dark Mode Support"
            description="Components automatically adapt to light/dark color scheme"
            variant="warning"
          />
        </View>

        {/* Nested Components */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
            Try It Out
          </Text>
          <NestedExample />
        </View>

        {/* Instructions */}
        <View className="bg-slate-200 dark:bg-slate-800 rounded-xl p-4 mb-6">
          <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            How to use the Inspector:
          </Text>
          <View className="gap-1">
            <Text className="text-sm text-slate-600 dark:text-slate-400">
              1. Tap the inspector button (bottom-right)
            </Text>
            <Text className="text-sm text-slate-600 dark:text-slate-400">
              2. Tap any component to inspect it
            </Text>
            <Text className="text-sm text-slate-600 dark:text-slate-400">
              3. View component hierarchy and styles
            </Text>
            <Text className="text-sm text-slate-600 dark:text-slate-400">
              4. Tap "Open" to jump to source code
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
