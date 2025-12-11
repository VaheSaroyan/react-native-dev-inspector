/**
 * Settings Page - Various UI components to test inspector
 */
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useState } from 'react';
import { CustomButton } from '../components/CustomButton';
import { SettingsItem } from '../components/SettingsItem';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { IconButton } from '../components/IconButton';

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.settingsGroup}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.groupContent}>{children}</View>
    </View>
  );
}

function NotificationSettings() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <SettingsGroup title="Notifications">
      <SettingsItem
        label="Push Notifications"
        description="Receive push notifications"
        right={
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: '#333', true: '#e94560' }}
          />
        }
      />
      <SettingsItem
        label="Email Notifications"
        description="Get updates via email"
        right={
          <Switch
            value={emailEnabled}
            onValueChange={setEmailEnabled}
            trackColor={{ false: '#333', true: '#e94560' }}
          />
        }
      />
      <SettingsItem
        label="Sound"
        description="Play notification sounds"
        right={
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: '#333', true: '#e94560' }}
          />
        }
      />
    </SettingsGroup>
  );
}

function AccountSettings() {
  return (
    <SettingsGroup title="Account">
      <SettingsItem
        label="Profile"
        description="Edit your profile information"
        right={<Badge text="Pro" color="#4ecdc4" />}
      />
      <SettingsItem
        label="Privacy"
        description="Manage your privacy settings"
      />
      <SettingsItem
        label="Security"
        description="Password and authentication"
        right={<Badge text="2FA" color="#f39c12" />}
      />
    </SettingsGroup>
  );
}

function AppearanceSettings() {
  return (
    <SettingsGroup title="Appearance">
      <Card style={styles.themeCard}>
        <Text style={styles.themeTitle}>Theme</Text>
        <View style={styles.themeButtons}>
          <IconButton icon="sun" label="Light" />
          <IconButton icon="moon" label="Dark" active />
          <IconButton icon="auto" label="Auto" />
        </View>
      </Card>
    </SettingsGroup>
  );
}

function AboutSection() {
  return (
    <SettingsGroup title="About">
      <Card>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Version</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Build</Text>
          <Text style={styles.aboutValue}>2024.12.1</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>React Native</Text>
          <Text style={styles.aboutValue}>0.76.2</Text>
        </View>
      </Card>
    </SettingsGroup>
  );
}

export default function SettingsPage() {
  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Settings' }} />

      <View style={styles.content}>
        <NotificationSettings />
        <AccountSettings />
        <AppearanceSettings />
        <AboutSection />

        <View style={styles.navSection}>
          <Link href="/" asChild>
            <CustomButton title="Back to Home" variant="secondary" />
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    padding: 20,
  },
  settingsGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  groupContent: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    overflow: 'hidden',
  },
  themeCard: {
    padding: 16,
  },
  themeTitle: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 12,
  },
  themeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  aboutLabel: {
    fontSize: 14,
    color: '#ccc',
  },
  aboutValue: {
    fontSize: 14,
    color: '#888',
  },
  navSection: {
    alignItems: 'center',
    marginTop: 20,
  },
});
