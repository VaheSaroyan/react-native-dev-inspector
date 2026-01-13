/**
 * Components Screen - NativeWind Inspector Example
 * Showcases various NativeWind styled components
 */

import { ScrollView, View, Text, Pressable, useColorScheme } from 'react-native';

// Button component with variants
function Button({
  title,
  onPress,
  variant = 'primary',
}: {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}) {
  const variantClasses = {
    primary: 'bg-indigo-600 active:bg-indigo-700',
    secondary: 'bg-slate-600 active:bg-slate-700',
    outline: 'bg-transparent border-2 border-indigo-600 active:bg-indigo-50',
    ghost: 'bg-transparent active:bg-slate-100 dark:active:bg-slate-800',
  };

  const textClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-indigo-600 dark:text-indigo-400',
    ghost: 'text-indigo-600 dark:text-indigo-400',
  };

  return (
    <Pressable
      className={`rounded-lg py-3 px-5 items-center mb-3 ${variantClasses[variant]}`}
      onPress={onPress}
    >
      <Text className={`text-base font-semibold ${textClasses[variant]}`}>
        {title}
      </Text>
    </Pressable>
  );
}

// Badge component
function Badge({
  label,
  color = 'indigo',
}: {
  label: string;
  color?: 'indigo' | 'emerald' | 'rose' | 'amber' | 'slate';
}) {
  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  };

  return (
    <View className={`px-3 py-1 rounded-full ${colorClasses[color]}`}>
      <Text className="text-xs font-medium">{label}</Text>
    </View>
  );
}

// Card component
function Card({
  title,
  description,
  variant = 'default',
}: {
  title: string;
  description: string;
  variant?: 'default' | 'elevated' | 'outlined';
}) {
  const variantClasses = {
    default: 'bg-white dark:bg-slate-800',
    elevated: 'bg-white dark:bg-slate-800 shadow-lg',
    outlined: 'bg-transparent border-2 border-slate-200 dark:border-slate-700',
  };

  return (
    <View className={`rounded-xl p-4 mb-3 ${variantClasses[variant]}`}>
      <Text className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">
        {title}
      </Text>
      <Text className="text-sm text-slate-600 dark:text-slate-400">
        {description}
      </Text>
    </View>
  );
}

// Avatar component
function Avatar({
  initials,
  size = 'md',
  color = 'indigo',
}: {
  initials: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'indigo' | 'emerald' | 'rose' | 'amber';
}) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const colorClasses = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    rose: 'bg-rose-500',
    amber: 'bg-amber-500',
  };

  return (
    <View
      className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full items-center justify-center`}
    >
      <Text className={`${textSizes[size]} font-bold text-white`}>
        {initials}
      </Text>
    </View>
  );
}

// Input preview (static)
function InputPreview({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {label}
      </Text>
      <View className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3">
        <Text className="text-slate-400 dark:text-slate-500">{placeholder}</Text>
      </View>
    </View>
  );
}

// Alert component
function Alert({
  title,
  message,
  type = 'info',
}: {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}) {
  const typeClasses = {
    info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
    success: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800',
    error: 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800',
  };

  const titleColors = {
    info: 'text-blue-800 dark:text-blue-200',
    success: 'text-emerald-800 dark:text-emerald-200',
    warning: 'text-amber-800 dark:text-amber-200',
    error: 'text-rose-800 dark:text-rose-200',
  };

  return (
    <View className={`rounded-lg p-4 mb-3 border ${typeClasses[type]}`}>
      <Text className={`text-sm font-semibold mb-1 ${titleColors[type]}`}>
        {title}
      </Text>
      <Text className="text-sm text-slate-600 dark:text-slate-400">{message}</Text>
    </View>
  );
}

export default function ComponentsScreen() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <ScrollView className={`flex-1 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
      <View className="p-4">
        {/* Buttons Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
            Buttons
          </Text>
          <Button title="Primary Button" variant="primary" />
          <Button title="Secondary Button" variant="secondary" />
          <Button title="Outline Button" variant="outline" />
          <Button title="Ghost Button" variant="ghost" />
        </View>

        {/* Badges Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
            Badges
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Badge label="Indigo" color="indigo" />
            <Badge label="Emerald" color="emerald" />
            <Badge label="Rose" color="rose" />
            <Badge label="Amber" color="amber" />
            <Badge label="Slate" color="slate" />
          </View>
        </View>

        {/* Cards Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
            Cards
          </Text>
          <Card title="Default Card" description="Standard card with subtle background" variant="default" />
          <Card title="Elevated Card" description="Card with shadow elevation" variant="elevated" />
          <Card title="Outlined Card" description="Card with border only" variant="outlined" />
        </View>

        {/* Avatars Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
            Avatars
          </Text>
          <View className="flex-row items-end gap-3 mb-3">
            <Avatar initials="SM" size="sm" color="indigo" />
            <Avatar initials="MD" size="md" color="emerald" />
            <Avatar initials="LG" size="lg" color="rose" />
          </View>
          <View className="flex-row gap-3">
            <Avatar initials="A" size="md" color="indigo" />
            <Avatar initials="B" size="md" color="emerald" />
            <Avatar initials="C" size="md" color="rose" />
            <Avatar initials="D" size="md" color="amber" />
          </View>
        </View>

        {/* Alerts Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
            Alerts
          </Text>
          <Alert title="Info" message="This is an informational alert message." type="info" />
          <Alert title="Success" message="Operation completed successfully!" type="success" />
          <Alert title="Warning" message="Please review before proceeding." type="warning" />
          <Alert title="Error" message="Something went wrong. Please try again." type="error" />
        </View>

        {/* Inputs Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
            Input Fields
          </Text>
          <InputPreview label="Email" placeholder="Enter your email..." />
          <InputPreview label="Password" placeholder="Enter your password..." />
        </View>
      </View>
    </ScrollView>
  );
}
