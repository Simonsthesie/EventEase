import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../utils/theme';
import { weatherService } from '../services/weatherService';

export const WeatherCard = ({ weather }) => {
  if (!weather) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="cloud-outline" size={20} color={theme.colors.primary} />
        <Text style={styles.title}>Météo</Text>
      </View>

      <View style={styles.content}>
        <Image
          source={{ uri: weatherService.getWeatherIconUrl(weather.icon) }}
          style={styles.icon}
        />
        <View style={styles.info}>
          <Text style={styles.temp}>{weather.temp}°C</Text>
          <Text style={styles.description}>{weather.description}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="water-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{weather.humidity}%</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="speedometer-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{weather.windSpeed} km/h</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    textTransform: 'capitalize',
  },
  detailItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  detailText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  details: {
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  icon: {
    height: 60,
    width: 60,
  },
  info: {
    marginLeft: theme.spacing.md,
  },
  temp: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
});
