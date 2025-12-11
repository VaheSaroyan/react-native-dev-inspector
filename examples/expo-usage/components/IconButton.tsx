/**
 * IconButton - A button with icon and label
 */
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface IconButtonProps {
  icon: 'sun' | 'moon' | 'auto';
  label: string;
  active?: boolean;
  onPress?: () => void;
}

const icons: Record<string, string> = {
  sun: '☀️',
  moon: '🌙',
  auto: '🔄',
};

export function IconButton({ icon, label, active, onPress }: IconButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.container, active && styles.active]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>{icons[icon]}</Text>
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: 70,
  },
  active: {
    backgroundColor: '#e94560',
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#888',
  },
  labelActive: {
    color: '#fff',
    fontWeight: '600',
  },
});
