/**
 * FeatureCard - Displays a feature with icon and description
 */
import { View, Text, StyleSheet } from 'react-native';

interface FeatureCardProps {
  icon: 'code' | 'zap' | 'inspect';
  title: string;
  description: string;
}

const icons: Record<string, string> = {
  code: '</> ',
  zap: '⚡ ',
  inspect: '🔍 ',
};

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icons[icon]}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#eee',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#888',
  },
});
