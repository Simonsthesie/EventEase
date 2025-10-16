/**
 * CalendarScreen
 * Calendrier mensuel + liste des événements du jour sélectionné
 */
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEvents } from '../contexts/EventContext';
import { EventCard } from '../components/EventCard';
import { EmptyState } from '../components/EmptyState';
import { theme } from '../utils/theme';
import { dateUtils } from '../utils/dateUtils';
import { locationService } from '../services/locationService';

export const CalendarScreen = ({ navigation }) => {
  const { events, toggleParticipation, deleteEvent } = useEvents();
  const [selectedDate, setSelectedDate] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  // Créer un objet de dates marquées pour le calendrier
  const markedDates = useMemo(() => {
    const marked = {};

    events.forEach(event => {
      const date = new Date(event.date).toISOString().split('T')[0];
      if (!marked[date]) {
        marked[date] = {
          marked: true,
          dots: [],
        };
      }

      marked[date].dots.push({
        color: event.participated ? theme.colors.success : theme.colors.primary,
      });
    });

    // Ajouter la sélection
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: theme.colors.primary,
      };
    }

    return marked;
  }, [events, selectedDate]);

  // Filtrer les événements pour la date sélectionnée
  const eventsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];

    let list = events.filter(event => {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      return eventDate === selectedDate;
    });

    // Ajouter la distance formatée si possible
    if (userLocation) {
      list = list.map(event => {
        if (event.latitude && event.longitude) {
          const d = locationService.calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            event.latitude,
            event.longitude
          );
          return { ...event, distance: locationService.formatDistance(d) };
        }
        return event;
      });
    }

    return list;
  }, [events, selectedDate]);

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const loc = await locationService.getCurrentLocation();
        setUserLocation(loc);
      } catch (e) {
        // ignore: pas de distance si refusée
      }
    };
    getUserLocation();
  }, []);

  const handleDayPress = day => {
    setSelectedDate(day.dateString);
  };

  const handleDelete = eventId => {
    Alert.alert("Supprimer l'événement", 'Êtes-vous sûr de vouloir supprimer cet événement ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        onPress: async () => {
          const result = await deleteEvent(eventId);
          if (!result.success) {
            Alert.alert('Erreur', "Impossible de supprimer l'événement");
          }
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.surface }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Calendrier</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content}>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={markedDates}
          markingType="multi-dot"
          theme={{
            backgroundColor: theme.colors.background,
            calendarBackground: theme.colors.surface,
            textSectionTitleColor: theme.colors.textSecondary,
            selectedDayBackgroundColor: theme.colors.primary,
            selectedDayTextColor: '#fff',
            todayTextColor: theme.colors.primary,
            dayTextColor: theme.colors.text,
            textDisabledColor: theme.colors.textLight,
            dotColor: theme.colors.primary,
            selectedDotColor: '#fff',
            arrowColor: theme.colors.primary,
            monthTextColor: theme.colors.text,
            indicatorColor: theme.colors.primary,
            textDayFontFamily: 'System',
            textMonthFontFamily: 'System',
            textDayHeaderFontFamily: 'System',
            textDayFontWeight: '400',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '600',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
          style={styles.calendar}
        />

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
            <Text style={styles.legendText}>Événement à venir</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
            <Text style={styles.legendText}>Participé</Text>
          </View>
        </View>

        {selectedDate && (
          <View style={styles.selectedDateSection}>
            <Text style={styles.selectedDateTitle}>{dateUtils.formatDate(selectedDate)}</Text>

            {eventsForSelectedDate.length === 0 ? (
              <EmptyState
                icon="calendar-outline"
                title="Aucun événement"
                message="Aucun événement prévu pour cette date"
                actionText="Créer un événement"
                onAction={() => navigation.navigate('EventForm')}
              />
            ) : (
              <View>
                {eventsForSelectedDate.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}
                    onParticipate={() => toggleParticipation(event.id)}
                    onEdit={() => navigation.navigate('EventForm', { eventId: event.id })}
                    onDelete={() => handleDelete(event.id)}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  calendar: {
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  legend: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    gap: theme.spacing.lg,
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    padding: theme.spacing.md,
  },
  legendDot: {
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  legendText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  selectedDateSection: {
    padding: theme.spacing.md,
  },
  selectedDateTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.md,
  },
});
