/**
 * EventListScreen
 * Liste + filtres + actions rapides (participer, modifier, supprimer)
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useEvents } from '../contexts/EventContext';
import { EventCard } from '../components/EventCard';
import { EmptyState } from '../components/EmptyState';
import { Loading } from '../components/Loading';
import { theme } from '../utils/theme';
import { locationService } from '../services/locationService';

export const EventListScreen = ({ navigation }: { navigation: any }) => {
  const { user, logout } = useAuth();
  const { events, loading, toggleParticipation, deleteEvent, refreshEvents } = useEvents();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, upcoming, participated
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      setUserLocation(location);

      // Calculer la distance pour chaque événement si ils ont une localisation
      // Cette logique pourrait être dans le contexte
    } catch (error) {
      console.log('Impossible de récupérer la localisation');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshEvents();
    await getUserLocation();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', onPress: logout, style: 'destructive' },
    ]);
  };

  const handleDelete = (eventId: string) => {
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

  const getFilteredEvents = () => {
    let filtered = [...events];

    if (filter === 'upcoming') {
      const now = new Date();
      filtered = filtered.filter(event => new Date(event.date) > now);
    } else if (filter === 'participated') {
      filtered = filtered.filter(event => event.participated);
    }

    // Trier par date (les plus récents en premier)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Ajouter la distance si disponible
    if (userLocation) {
      filtered = filtered.map(event => {
        if (event.latitude && event.longitude) {
          const distance = locationService.calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            event.latitude,
            event.longitude
          );
          return {
            ...event,
            distance: locationService.formatDistance(distance),
          };
        }
        return event;
      });
    }

    return filtered;
  };

  const filteredEvents = getFilteredEvents();

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.surface }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.userName}>{user?.name || 'Utilisateur'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Calendar')}
            >
              <Ionicons name="calendar-outline" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>Tous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'upcoming' && styles.filterButtonActive]}
          onPress={() => setFilter('upcoming')}
        >
          <Text style={[styles.filterText, filter === 'upcoming' && styles.filterTextActive]}>
            À venir
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'participated' && styles.filterButtonActive]}
          onPress={() => setFilter('participated')}
        >
          <Text style={[styles.filterText, filter === 'participated' && styles.filterTextActive]}>
            Participés
          </Text>
        </TouchableOpacity>
      </View>

      {filteredEvents.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="Aucun événement"
          message={
            filter === 'all'
              ? 'Commencez par créer votre premier événement'
              : filter === 'upcoming'
                ? 'Aucun événement à venir'
                : "Vous n'avez participé à aucun événement"
          }
          actionText={filter === 'all' ? 'Créer un événement' : undefined}
          onAction={filter === 'all' ? () => navigation.navigate('EventForm') : undefined}
        />
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}
              onParticipate={() => toggleParticipation(item.id)}
              onEdit={() => navigation.navigate('EventForm', { eventId: item.id })}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('EventForm')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  fab: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    bottom: theme.spacing.lg,
    height: 64,
    justifyContent: 'center',
    position: 'absolute',
    right: theme.spacing.lg,
    width: 64,
    ...theme.shadows.lg,
  },
  filterButton: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  filterText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
  filterTextActive: {
    color: '#fff',
  },
  greeting: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
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
  listContent: {
    padding: theme.spacing.md,
  },
  userName: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
  },
});
