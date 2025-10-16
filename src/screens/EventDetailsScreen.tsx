/**
 * EventDetailsScreen
 * Détails d'un événement + météo + action participer + Maps
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEvents } from '../contexts/EventContext';
import { Button } from '../components/Button';
import { WeatherCard } from '../components/WeatherCard';
import { theme } from '../utils/theme';
import { dateUtils } from '../utils/dateUtils';
import { weatherService } from '../services/weatherService';
import type { EventItem } from '../contexts/EventContext';
import { locationService } from '../services/locationService';

export const EventDetailsScreen = ({ navigation, route }: { navigation: any; route: any }) => {
  const { eventId } = route.params;
  const { getEventById, toggleParticipation, deleteEvent } = useEvents();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState(null);
  const [distanceText, setDistanceText] = useState('');

  const loadEvent = useCallback(() => {
    const eventData = getEventById(eventId);
    setEvent(eventData || null);
  }, [eventId, getEventById]);

  const loadWeather = useCallback(async () => {
    setLoadingWeather(true);
    try {
      const weatherData = await weatherService.getWeatherForEvent({
        eventDateISO: event?.date || new Date().toISOString(),
        city: event?.location || undefined,
        lat: event?.latitude ?? undefined,
        lon: event?.longitude ?? undefined,
      });
      setWeather(weatherData);
    } catch (error) {
      console.error('Erreur lors du chargement de la météo:', error);
    } finally {
      setLoadingWeather(false);
    }
  }, [event?.date, event?.location, event?.latitude, event?.longitude]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  useEffect(() => {
    if (event) {
      loadWeather();
    }
  }, [event, loadWeather]);

  useEffect(() => {
    const getUserLocationAndDistance = async () => {
      try {
        if (!event?.latitude || !event?.longitude) return;
        const loc = await locationService.getCurrentLocation();
        setUserLocation(loc as any);
        const d = locationService.calculateDistance(
          loc.latitude,
          loc.longitude,
          event.latitude,
          event.longitude
        );
        setDistanceText(locationService.formatDistance(d));
      } catch (e) {
        // pas de distance si refusée/indispo
      }
    };
    if (event) {
      getUserLocationAndDistance();
    }
  }, [event?.latitude, event?.longitude, event]);

  const handleParticipate = async () => {
    await toggleParticipation(eventId);
    loadEvent();
  };

  const handleEdit = () => {
    navigation.navigate('EventForm', { eventId });
  };

  const handleDelete = () => {
    Alert.alert("Supprimer l'événement", 'Êtes-vous sûr de vouloir supprimer cet événement ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        onPress: async () => {
          const result = await deleteEvent(eventId);
          if (result.success) {
            navigation.goBack();
          } else {
            Alert.alert('Erreur', "Impossible de supprimer l'événement");
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleOpenMap = () => {
    if (event && event.latitude && event.longitude) {
      const url = Platform.select({
        ios: `maps:0,0?q=${event.latitude},${event.longitude}`,
        android: `geo:0,0?q=${event.latitude},${event.longitude}`,
      });
      if (url) Linking.openURL(url);
    } else if (event && event.location) {
      const url = Platform.select({
        ios: `maps:0,0?q=${encodeURIComponent(event.location)}`,
        android: `geo:0,0?q=${encodeURIComponent(event.location)}`,
      });
      if (url) Linking.openURL(url);
    }
  };

  if (!event) {
    return (
      <View style={styles.container}>
        <Text>Événement introuvable</Text>
      </View>
    );
  }

  const isToday = event ? dateUtils.isToday(event.date) : false;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.surface }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleEdit} style={styles.iconButton}>
              <Ionicons name="pencil-outline" size={20} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
              <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.dateContainer}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateDay}>{new Date(event.date).getDate()}</Text>
            <Text style={styles.dateMonth}>
              {new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' })}
            </Text>
          </View>
          <View style={styles.dateInfo}>
            <Text style={styles.dateText}>{dateUtils.getDayOfWeek(event.date)}</Text>
            <Text style={styles.dateTimeText}>{dateUtils.formatTime(event.date)}</Text>
            {isToday && (
              <View style={styles.todayBadge}>
                <Text style={styles.todayBadgeText}>Aujourd’hui</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.title}>{event.title}</Text>

        {event.participated && (
          <View style={styles.participatedBanner}>
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
            <Text style={styles.participatedText}>Vous participez à cet événement</Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Description</Text>
          </View>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        {event.location && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Lieu</Text>
            </View>
            <Text style={styles.location}>{event.location}</Text>
            {distanceText ? (
              <Text style={styles.distanceText}>Distance: {distanceText}</Text>
            ) : null}
            {event.latitude && event.longitude && (
              <TouchableOpacity style={styles.mapButton} onPress={handleOpenMap}>
                <Ionicons name="map-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.mapButtonText}>Ouvrir dans Maps</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {loadingWeather && (
          <View style={styles.section}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        )}

        {weather && !loadingWeather && (
          <View style={styles.section}>
            <WeatherCard weather={weather} />
          </View>
        )}

        <View style={styles.actions}>
          <Button
            title={event.participated ? 'Annuler la participation' : 'Participer'}
            onPress={handleParticipate}
            variant={event.participated ? 'outline' : 'primary'}
            icon={
              <Ionicons
                name={event.participated ? 'close-circle-outline' : 'checkmark-circle-outline'}
                size={24}
                color={event.participated ? theme.colors.primary : '#fff'}
              />
            }
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  actions: {
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.lg,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  dateBadge: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    height: 70,
    justifyContent: 'center',
    width: 70,
  },
  dateContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  dateDay: {
    color: '#fff',
    fontSize: 28,
    fontWeight: theme.fontWeight.bold,
  },
  dateInfo: {
    flex: 1,
  },
  dateMonth: {
    color: '#fff',
    fontSize: theme.fontSize.sm,
    textTransform: 'uppercase',
  },
  dateText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
  dateTimeText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    lineHeight: 24,
  },
  header: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  location: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    marginBottom: theme.spacing.sm,
  },
  distanceText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.sm,
  },
  mapButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
  },
  mapButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },
  participatedBanner: {
    alignItems: 'center',
    backgroundColor: theme.colors.success + '20',
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
  },
  participatedText: {
    color: theme.colors.success,
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    lineHeight: 38,
    marginBottom: theme.spacing.lg,
  },
  todayBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.sm,
    marginTop: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  todayBadgeText: {
    color: '#fff',
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
});
