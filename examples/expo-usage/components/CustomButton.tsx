/**
 * CustomButton - A reusable button component
 */
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { forwardRef } from 'react';

interface CustomButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
}

export const CustomButton = forwardRef<any, CustomButtonProps>(
  ({ title, onPress, variant = 'primary' }, ref) => {
    return (
      <TouchableOpacity
        ref={ref}
        style={[styles.button, variant === 'secondary' && styles.buttonSecondary]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.buttonText,
            variant === 'secondary' && styles.buttonTextSecondary,
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#e94560',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e94560',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextSecondary: {
    color: '#e94560',
  },
});
