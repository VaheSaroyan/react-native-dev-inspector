/**
 * Root Layout - wraps all pages with Inspector
 */
import { Stack } from 'expo-router';
import { Inspector, InspectorDevMenu } from 'react-native-dev-inspector';
import { View, StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <Inspector editor="webstorm">
      <View style={styles.container}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#16213e' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
            contentStyle: { backgroundColor: '#1a1a2e' },
          }}
        />
        <InspectorDevMenu position="bottom-right" />
      </View>
    </Inspector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
});
