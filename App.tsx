import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import {SkiaDemo} from './components/SkiaDemo';

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="#1a1a2e"
      />
      <View style={styles.header}>
        <Text style={styles.title}>🎨 React Native Skia Demo</Text>
        <Text style={styles.subtitle}>
          展示渐变、图形和路径绘制
        </Text>
      </View>
      <SkiaDemo />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    padding: 20,
    backgroundColor: '#16213e',
    borderBottomWidth: 2,
    borderBottomColor: '#667eea',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#a0a0a0',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default App;