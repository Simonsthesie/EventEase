/**
 * EventContext
 * Expose: events, loading, CRUD, toggleParticipation, getEventById, refresh
 * Persiste les modifications via storageService
 */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { storageService } from '../services/storageService';

const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const loadedEvents = await storageService.getEvents();
      setEvents(loadedEvents);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async eventData => {
    try {
      const newEvent = {
        id: Date.now().toString(),
        ...eventData,
        participated: false,
        createdAt: new Date().toISOString(),
      };
      const updatedEvents = [...events, newEvent];
      await storageService.saveEvents(updatedEvents);
      setEvents(updatedEvents);
      return { success: true, event: newEvent };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateEvent = async (eventId, eventData) => {
    try {
      const updatedEvents = events.map(event =>
        event.id === eventId
          ? { ...event, ...eventData, updatedAt: new Date().toISOString() }
          : event
      );
      await storageService.saveEvents(updatedEvents);
      setEvents(updatedEvents);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteEvent = async eventId => {
    try {
      const updatedEvents = events.filter(event => event.id !== eventId);
      await storageService.saveEvents(updatedEvents);
      setEvents(updatedEvents);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const toggleParticipation = async eventId => {
    try {
      const updatedEvents = events.map(event =>
        event.id === eventId ? { ...event, participated: !event.participated } : event
      );
      await storageService.saveEvents(updatedEvents);
      setEvents(updatedEvents);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getEventById = eventId => {
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

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents doit être utilisé dans un EventProvider');
  }
  return context;
};
