require('dotenv').config();

export default {
  expo: {
    name: 'EventEase',
    slug: 'eventease',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/eventease.png',
    splash: {
      image: './assets/eventease.png',
      resizeMode: 'contain',
      backgroundColor: '#6366f1',
    },
    userInterfaceStyle: 'light',
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.eventease.app',
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'EventEase utilise votre position pour vous aider à localiser les événements à proximité.',
        NSLocationAlwaysUsageDescription:
          'EventEase utilise votre position pour vous aider à localiser les événements.',
      },
    },
    android: {
      package: 'com.eventease.app',
      permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
      adaptiveIcon: {
        foregroundImage: './assets/eventease.png',
        backgroundColor: '#6366f1',
      },
    },
    web: {
      favicon: './assets/eventease.png',
    },
    plugins: ['expo-location', 'expo-font'],
    extra: {
      eas: {
        projectId: 'your-project-id',
      },
      // Clé lue depuis .env ou variables d'environnement EAS
      openWeatherApiKey: process.env.OPENWEATHER_API_KEY,
    },
  },
};
