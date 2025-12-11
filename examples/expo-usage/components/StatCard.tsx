/**
 * StatCard - Displays a statistic with label
 */
import { View, Text, StyleSheet } from 'react-native';

interface StatCardProps {
  label: string;
  value: number;
  color?: string;
}

export function StatCard({ label, value, color = '#e94560' }: StatCardProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.value, { color }]}>{value.toLocaleString()}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
  },
});
