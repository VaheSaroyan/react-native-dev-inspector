/**
 * Badge - A small badge/tag component
 */
import { View, Text, StyleSheet } from 'react-native';

interface BadgeProps {
  text: string;
  color?: string;
}

export function Badge({ text, color = '#e94560' }: BadgeProps) {
  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
});
