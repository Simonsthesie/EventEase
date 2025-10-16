/**
 * EventContext
 * Expose: events, loading, CRUD, toggleParticipation, getEventById, refresh
 * Persiste les modifications via storageService
 */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { storageService } from '../services/storageService';

export type EventItem = {
  id: string;
  title: string;
  description: string;
  date: string; // ISO
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
  participated: boolean;
  createdAt: string;
  updatedAt?: string;
  distance?: string;
};

type EventResult = { success: true } | { success: false; error: string };

interface EventContextValue {
  events: EventItem[];
  loading: boolean;
  addEvent: (
    eventData: Partial<EventItem>
  ) => Promise<{ success: true; event: EventItem } | { success: false; error: string }>;
  updateEvent: (eventId: string, eventData: Partial<EventItem>) => Promise<EventResult>;
  deleteEvent: (eventId: string) => Promise<EventResult>;
  toggleParticipation: (eventId: string) => Promise<EventResult>;
  getEventById: (eventId: string) => EventItem | undefined;
  refreshEvents: () => Promise<void>;
}

const EventContext = createContext<EventContextValue | undefined>(undefined);

type ProviderProps = { children: React.ReactNode };

export const EventProvider = ({ children }: ProviderProps) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async (): Promise<void> => {
    try {
      const loadedEvents = await storageService.getEvents();
      setEvents((loadedEvents as unknown) as EventItem[]);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (
    eventData: Partial<EventItem>
  ): Promise<{ success: true; event: EventItem } | { success: false; error: string }> => {
    try {
      const newEvent: EventItem = {
        id: Date.now().toString(),
        title: (eventData.title as string) || '',
        description: (eventData.description as string) || '',
        date: (eventData.date as string) || new Date().toISOString(),
        location: eventData.location,
        latitude: eventData.latitude ?? null,
        longitude: eventData.longitude ?? null,
        participated: false,
        createdAt: new Date().toISOString(),
      };
      const updatedEvents = [...events, newEvent];
      await storageService.saveEvents(updatedEvents);
      setEvents(updatedEvents);
      return { success: true, event: newEvent } as const;
    } catch (error: any) {
      return { success: false, error: error.message } as const;
    }
  };

  const updateEvent = async (eventId: string, eventData: Partial<EventItem>): Promise<EventResult> => {
    try {
      const updatedEvents = events.map(event =>
        event.id === eventId
          ? { ...event, ...eventData, updatedAt: new Date().toISOString() }
          : event
      );
      await storageService.saveEvents(updatedEvents);
      setEvents(updatedEvents);
      return { success: true } as const;
    } catch (error: any) {
      return { success: false, error: error.message } as const;
    }
  };

  const deleteEvent = async (eventId: string): Promise<EventResult> => {
    try {
      const updatedEvents = events.filter(event => event.id !== eventId);
      await storageService.saveEvents(updatedEvents);
      setEvents(updatedEvents);
      return { success: true } as const;
    } catch (error: any) {
      return { success: false, error: error.message } as const;
    }
  };

  const toggleParticipation = async (eventId: string): Promise<EventResult> => {
    try {
      const updatedEvents = events.map(event =>
        event.id === eventId ? { ...event, participated: !event.participated } : event
      );
      await storageService.saveEvents(updatedEvents);
      setEvents(updatedEvents);
      return { success: true } as const;
    } catch (error: any) {
      return { success: false, error: error.message } as const;
    }
  };

  const getEventById = (eventId: string) => {
    return events.find(event => event.id === eventId);
  };

  return (
    <EventContext.Provider
      value={{
        events,
        loading,
        addEvent,
        updateEvent,
        deleteEvent,
        toggleParticipation,
        getEventById,
        refreshEvents: loadEvents,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = (): EventContextValue => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents doit être utilisé dans un EventProvider');
  }
  return context;
};
