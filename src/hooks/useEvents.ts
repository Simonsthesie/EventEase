// Hook personnalisé pour gérer les événements
// Note: Le hook principal est déjà exporté depuis EventContext
// Ce fichier peut contenir des hooks supplémentaires si nécessaire

import { useState, useEffect } from 'react';
import { useEvents as useEventsContext, EventItem } from '../contexts/EventContext';

type Filter = 'all' | 'upcoming' | 'participated' | 'past';

// Hook pour filtrer les événements
export const useFilteredEvents = (filter: Filter = 'all') => {
  const { events } = useEventsContext();
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    let filtered = [...events];

    if (filter === 'upcoming') {
      const now = new Date();
      filtered = filtered.filter(event => new Date(event.date) > now);
    } else if (filter === 'participated') {
      filtered = filtered.filter(event => event.participated);
    } else if (filter === 'past') {
      const now = new Date();
      filtered = filtered.filter(event => new Date(event.date) < now);
    }

    // Trier par date (les plus récents en premier)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredEvents(filtered);
  }, [events, filter]);

  return filteredEvents;
};

// Hook pour obtenir les statistiques d'événements
export const useEventStats = () => {
  const { events } = useEventsContext();

  const stats = {
    total: events.length,
    upcoming: events.filter(e => new Date(e.date) > new Date()).length,
    participated: events.filter(e => e.participated).length,
    past: events.filter(e => new Date(e.date) < new Date()).length,
  };

  return stats;
};
