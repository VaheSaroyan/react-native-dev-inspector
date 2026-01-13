/**
 * Profile Screen - NativeWind Inspector Example
 * User profile page with NativeWind styling
 */

import { ScrollView, View, Text, Pressable, useColorScheme } from 'react-native';

// Avatar component
function Avatar({ initials, size = 'lg' }: { initials: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  return (
    <View
      className={`${sizeClasses[size]} bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full items-center justify-center`}
    >
      <Text className={`${textSizes[size]} font-bold text-white`}>{initials}</Text>
    </View>
  );
}

// Badge component
function Badge({ label, color = 'indigo' }: { label: string; color?: 'indigo' | 'emerald' }) {
  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  };

  return (
    <View className={`px-3 py-1 rounded-full ${colorClasses[color]}`}>
      <Text className="text-xs font-medium">{label}</Text>
    </View>
  );
}

// Profile header section
function ProfileHeader() {
  return (
    <View className="bg-white dark:bg-slate-800 rounded-2xl p-6 items-center shadow-sm mb-6">
      <Avatar initials="JD" size="xl" />
      <Text className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-4">
        John Doe
      </Text>
      <Text className="text-slate-500 dark:text-slate-400 mt-1">
        john.doe@example.com
      </Text>
      <View className="flex-row gap-2 mt-3">
        <Badge label="Pro User" color="indigo" />
        <Badge label="Verified" color="emerald" />
      </View>

      {/* Stats row */}
      <View className="flex-row mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 w-full">
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold text-slate-800 dark:text-slate-100">127</Text>
          <Text className="text-xs text-slate-500 dark:text-slate-400">Projects</Text>
        </View>
        <View className="flex-1 items-center border-x border-slate-200 dark:border-slate-700">
          <Text className="text-2xl font-bold text-slate-800 dark:text-slate-100">4.9k</Text>
          <Text className="text-xs text-slate-500 dark:text-slate-400">Followers</Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold text-slate-800 dark:text-slate-100">892</Text>
          <Text className="text-xs text-slate-500 dark:text-slate-400">Following</Text>
        </View>
      </View>
    </View>
  );
}

// Menu item component
function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
  danger = false,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      className="flex-row items-center bg-white dark:bg-slate-800 rounded-xl p-4 mb-2 active:bg-slate-50 dark:active:bg-slate-700"
      onPress={onPress}
    >
      <View className={`w-10 h-10 rounded-full items-center justify-center ${
        danger ? 'bg-rose-100 dark:bg-rose-900/30' : 'bg-slate-100 dark:bg-slate-700'
      }`}>
        <Text className={`text-lg ${danger ? 'text-rose-600' : 'text-slate-600 dark:text-slate-300'}`}>
          {icon}
        </Text>
      </View>
      <View className="flex-1 ml-3">
        <Text className={`text-base font-medium ${
          danger ? 'text-rose-600' : 'text-slate-800 dark:text-slate-100'
        }`}>
          {title}
        </Text>
        {subtitle && (
          <Text className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</Text>
        )}
      </View>
      <Text className="text-slate-400">&gt;</Text>
    </Pressable>
  );
}

// Section component
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 px-1">
        {title}
      </Text>
      {children}
    </View>
  );
}

export default function ProfileScreen() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <ScrollView className={`flex-1 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
      <View className="p-4">
        <ProfileHeader />

        <Section title="Account">
          <MenuItem icon="@" title="Edit Profile" subtitle="Update your personal info" />
          <MenuItem icon="#" title="Privacy" subtitle="Manage your privacy settings" />
          <MenuItem icon="!" title="Notifications" subtitle="Configure alerts" />
        </Section>

        <Section title="Preferences">
          <MenuItem icon="*" title="Appearance" subtitle="Theme, colors, fonts" />
          <MenuItem icon="$" title="Language" subtitle="English (US)" />
          <MenuItem icon="%" title="Accessibility" subtitle="Visual and audio settings" />
        </Section>

        <Section title="Support">
          <MenuItem icon="?" title="Help Center" subtitle="FAQs and guides" />
          <MenuItem icon="&" title="Contact Us" subtitle="Get in touch" />
          <MenuItem icon="~" title="About" subtitle="Version 1.0.0" />
        </Section>

        <Section title="Danger Zone">
          <MenuItem icon="X" title="Sign Out" danger />
          <MenuItem icon="X" title="Delete Account" subtitle="Permanently remove your data" danger />
        </Section>

        {/* Footer */}
        <View className="items-center py-6">
          <Text className="text-sm text-slate-400 dark:text-slate-500">
            NativeWind + Inspector Demo
          </Text>
          <Text className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Try inspecting any component above!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
