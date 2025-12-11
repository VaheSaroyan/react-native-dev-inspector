/**
 * SettingsItem - A settings row item
 */
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ReactNode } from 'react';

interface SettingsItemProps {
  label: string;
  description?: string;
  right?: ReactNode;
  onPress?: () => void;
}

export function SettingsItem({ label, description, right, onPress }: SettingsItemProps) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      {right && <View style={styles.rightContainer}>{right}</View>}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    color: '#eee',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: '#666',
  },
  rightContainer: {
    marginLeft: 12,
  },
});
