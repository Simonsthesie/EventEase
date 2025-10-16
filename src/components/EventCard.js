import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../utils/theme';
import { dateUtils } from '../utils/dateUtils';

export const EventCard = ({ event, onPress, onParticipate, onEdit, onDelete }) => {
  const isPast = dateUtils.isPast(event.date);
  const isToday = dateUtils.isToday(event.date);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isPast && styles.pastCard,
        event.participated && styles.participatedCard,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color={isToday ? theme.colors.primary : theme.colors.textSecondary}
          />
          <Text style={[styles.date, isToday && styles.todayDate]}>
            {dateUtils.formatShortDate(event.date)}
          </Text>
          {isToday && (
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>Aujourd’hui</Text>
            </View>
          )}
        </View>
        {event.participated && (
          <View style={styles.participatedBadge}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
            <Text style={styles.participatedText}>Participé</Text>
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {event.title}
      </Text>

      <Text style={styles.description} numberOfLines={2}>
        {event.description}
      </Text>

      {event.location && (
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.location} numberOfLines={1}>
            {event.location}
          </Text>
          {event.distance && <Text style={styles.distance}>• {event.distance}</Text>}
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.actionButton, event.participated && styles.participatedButton]}
          onPress={onParticipate}
        >
          <Ionicons
            name={event.participated ? 'checkmark-circle' : 'add-circle-outline'}
            size={20}
            color={event.participated ? theme.colors.success : theme.colors.primary}
          />
          <Text
            style={[styles.actionButtonText, event.participated && styles.participatedButtonText]}
          >
            {event.participated ? 'Participé' : 'Participer'}
          </Text>
        </TouchableOpacity>

        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity style={styles.iconButton} onPress={onEdit}>
              <Ionicons name="pencil-outline" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity style={styles.iconButton} onPress={onDelete}>
              <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  actionButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    ...theme.shadows.md,
  },
  date: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
  dateContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  distance: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
  footer: {
    alignItems: 'center',
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  iconButton: {
    padding: theme.spacing.xs,
  },
  location: {
    color: theme.colors.textSecondary,
    flex: 1,
    fontSize: theme.fontSize.sm,
  },
  locationContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginBottom: theme.spacing.md,
  },
  participatedBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  participatedButton: {
    backgroundColor: 'transparent',
  },
  participatedButtonText: {
    color: theme.colors.success,
  },
  participatedCard: {
    borderLeftColor: theme.colors.success,
    borderLeftWidth: 4,
  },
  participatedText: {
    color: theme.colors.success,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
  },
  pastCard: {
    opacity: 0.7,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.xs,
  },
  todayBadge: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  todayBadgeText: {
    color: '#fff',
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  todayDate: {
    color: theme.colors.primary,
  },
});
