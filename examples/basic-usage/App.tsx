/**
 * Basic Usage Example - React Native Dev Inspector
 * This shows how to integrate the inspector into a bare React Native app
 * with React Navigation
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  useColorScheme,
  Pressable,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Inspector, InspectorDevMenu } from '@rn-dev-inspector/core';

const Stack = createNativeStackNavigator();

// Example Header component
function Header() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={[styles.header, isDarkMode && styles.headerDark]}>
      <Text style={styles.headerTitle}>React Native Dev Inspector</Text>
      <Text style={styles.headerSubtitle}>Click-to-inspect Demo</Text>
    </View>
  );
}

// Feature card component
function Card({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
  );
}

// Nested component example
function NestedExample() {
  return (
    <View style={styles.nestedContainer}>
      <Text style={styles.nestedTitle}>Nested Components</Text>
      <View style={styles.nestedInner}>
        <Text style={styles.nestedText}>Level 1</Text>
        <View style={styles.nestedInner}>
          <Text style={styles.nestedText}>Level 2</Text>
          <View style={styles.nestedInner}>
            <Text style={styles.nestedText}>Level 3 - Try inspecting me!</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// Custom button component
function CustomButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

// Home Screen
function HomeScreen({ navigation }: any) {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Header />

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
            Navigation Test
          </Text>
          <CustomButton
            title="Go to Details"
            onPress={() => navigation.navigate('Details')}
          />
          <CustomButton
            title="Go to Profile"
            onPress={() => navigation.navigate('Profile')}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
            Features
          </Text>

          <Card
            title="Click to Inspect"
            description="Tap any component to see its source file and line number"
          />

          <Card
            title="Open in Editor"
            description="Tap again to open the source code in your preferred IDE"
          />

          <Card
            title="Dev Menu Integration"
            description="Toggle inspector from the floating button or React Native dev menu"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
            Try It Out
          </Text>
          <NestedExample />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Details Screen
function DetailsScreen({ navigation }: any) {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
            Details Screen
          </Text>
          <Card
            title="Navigation Works!"
            description="This is the details screen. Try inspecting these components."
          />
          <Card
            title="SceneView Test"
            description="The inspector should skip React Navigation internal components like SceneView"
          />
          <CustomButton title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Profile Screen
function ProfileScreen({ navigation }: any) {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
            Profile Screen
          </Text>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profileEmail}>john@example.com</Text>
          </View>
          <CustomButton title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Main app with navigation
function App() {
  return (
    <Inspector>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Details"
            component={DetailsScreen}
            options={{ title: 'Details' }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: 'Profile' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <InspectorDevMenu />
    </Inspector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    backgroundColor: '#2c3e50',
    padding: 20,
    paddingTop: 10,
  },
  headerDark: {
    backgroundColor: '#1e2d3d',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#bdc3c7',
    fontSize: 14,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  textDark: {
    color: '#ecf0f1',
  },
  textMutedDark: {
    color: '#95a5a6',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  paragraph: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 8,
    paddingLeft: 8,
  },
  nestedContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nestedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  nestedInner: {
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
  },
  nestedText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
  },
  profileEmail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
});

export default App;
