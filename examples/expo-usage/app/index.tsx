/**
 * Home Page - Profile and navigation
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Link, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Avatar } from '../components/avatar';
import { CustomButton } from '../components/CustomButton';
import { StatCard } from '../components/StatCard';
import { FeatureCard } from '../components/FeatureCard';

function ProfileCard({
  name,
  role,
  bio,
}: {
  name: string;
  role: string;
  bio: string;
}) {
  return (
    <View style={styles.profileCard}>
      <Avatar name={name} />
      <Text style={styles.profileName}>{name}</Text>
      <Text style={styles.profileRole}>{role}</Text>
      <Text style={styles.profileBio}>{bio}</Text>
      <View style={styles.buttonRow}>
        <CustomButton title="Follow" />
        <CustomButton title="Message" variant="secondary" />
      </View>
    </View>
  );
}

function StatsSection() {
  return (
    <View style={styles.statsSection}>
      <Text style={styles.sectionTitle}>Statistics</Text>
      <View style={styles.statsRow}>
        <StatCard label="Projects" value={42} color="#e94560" />
        <StatCard label="Followers" value={1234} color="#4ecdc4" />
        <StatCard label="Following" value={89} color="#f39c12" />
      </View>
    </View>
  );
}

function FeaturesSection() {
  return (
    <View style={styles.featuresSection}>
      <Text style={styles.sectionTitle}>Features</Text>
      <FeatureCard
        icon="code"
        title="React Native"
        description="Build native apps using React"
      />
      <FeatureCard
        icon="zap"
        title="Fast Refresh"
        description="See changes instantly"
      />
      <FeatureCard
        icon="inspect"
        title="Dev Inspector"
        description="Click to open in editor"
      />
    </View>
  );
}

export default function HomePage() {
  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Home' }} />
      <StatusBar style="light" />

      <View style={styles.content}>
        <ProfileCard
          name="Jane Developer"
          role="React Native Engineer"
          bio="Building awesome mobile apps with React Native and Expo. Love open source!"
        />

        <StatsSection />
        <FeaturesSection />

        <View style={styles.navSection}>
          <Text style={styles.sectionTitle}>Navigation</Text>
          <Link href="/settings" asChild>
            <CustomButton title="Go to Settings" variant="secondary" />
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
  profileCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#eee',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 12,
  },
  profileBio: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#eee',
    marginBottom: 16,
  },
  statsSection: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  featuresSection: {
    marginBottom: 24,
  },
  navSection: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
});
