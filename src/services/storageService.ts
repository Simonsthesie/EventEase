/**
 * Storage Service
 * Gestion centralisée de la persistance locale via AsyncStorage
 * - Clés: événements, utilisateurs, utilisateur courant
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { EventItem } from '../contexts/EventContext';

const EVENTS_KEY = '@eventease_events';
const USERS_KEY = '@eventease_users';
const CURRENT_USER_KEY = '@eventease_current_user';

export const storageService = {
  // Événements
  /**
   * Récupère tous les événements
   * @returns {Promise<Array>} Liste d'événements (vide si aucune donnée)
   */
  async getEvents(): Promise<EventItem[]> {
    try {
      const data = await AsyncStorage.getItem(EVENTS_KEY);
      return data ? (JSON.parse(data) as EventItem[]) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      return [];
    }
  },

  /**
   * Sauvegarde la liste des événements
   * @param {Array} events Liste d'événements
   * @returns {Promise<void>}
   */
  async saveEvents(events: EventItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des événements:', error);
      throw error;
    }
  },

  /**
   * Supprime tous les événements
   * @returns {Promise<void>}
   */
  async clearEvents() {
    try {
      await AsyncStorage.removeItem(EVENTS_KEY);
    } catch (error) {
      console.error('Erreur lors de la suppression des événements:', error);
    }
  },

  // Utilisateurs
  /**
   * Récupère tous les utilisateurs
   * @returns {Promise<Array>} Liste d'utilisateurs (vide si aucune donnée)
   */
  async getUsers(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(USERS_KEY);
      return data ? (JSON.parse(data) as any[]) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return [];
    }
  },

  /**
   * Sauvegarde la liste des utilisateurs
   * @param {Array} users Liste d'utilisateurs
   * @returns {Promise<void>}
   */
  async saveUsers(users: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des utilisateurs:', error);
      throw error;
    }
  },

  /**
   * Récupère l'utilisateur courant
   * @returns {Promise<Object|null>} Utilisateur courant ou null
   */
  async getCurrentUser(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(CURRENT_USER_KEY);
      return data ? (JSON.parse(data) as any) : null;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur actuel:", error);
      return null;
    }
  },

  /**
   * Sauvegarde l'utilisateur courant (sans mot de passe)
   * @param {Object|null} user Utilisateur à sauvegarder (ou null pour effacer)
   * @returns {Promise<void>}
   */
  async saveCurrentUser(user: any): Promise<void> {
    try {
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'utilisateur actuel:", error);
      throw error;
    }
  },

  /**
   * Efface l'utilisateur courant
   * @returns {Promise<void>}
   */
  async clearCurrentUser() {
    try {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur actuel:", error);
    }
  },

  /**
   * Efface toutes les données de l'application
   * @returns {Promise<void>}
   */
  async clearAll() {
    try {
      await AsyncStorage.multiRemove([EVENTS_KEY, USERS_KEY, CURRENT_USER_KEY]);
    } catch (error) {
      console.error('Erreur lors de la suppression de toutes les données:', error);
    }
  },
};
