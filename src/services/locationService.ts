/**
 * Location Service (expo-location)
 * - Demande de permission, récupération position, calcul et format de distance
 */
import * as Location from 'expo-location';

export const locationService = {
  async requestPermission() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      return false;
    }
  },

  async getCurrentLocation() {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        throw new Error('Permission de localisation refusée');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la localisation:', error);
      throw error;
    }
  },

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    // Formule de Haversine pour calculer la distance entre deux points
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  },

  toRad(degrees: number) {
    return degrees * (Math.PI / 180);
  },

  formatDistance(distanceKm: number) {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} m`;
    }
    return `${distanceKm.toFixed(1)} km`;
  },
};
