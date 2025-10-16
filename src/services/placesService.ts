import axios from 'axios';

// Service d'autocomplétion d'adresses basé sur Nominatim (OpenStreetMap)
// Respectez les conditions d'utilisation de Nominatim et évitez de surcharger l'API.
// Un debounce côté UI est recommandé pour limiter les requêtes.

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

export type PlaceSuggestion = {
  id: string;
  title: string;
  subtitle?: string;
  displayName: string;
  lat: number;
  lon: number;
};

export const placesService = {
  async search(query: string, limit: number = 5): Promise<PlaceSuggestion[]> {
    try {
      if (!query || query.trim().length < 2) return [];

      const response = await axios.get(NOMINATIM_BASE_URL, {
        params: {
          q: query,
          format: 'json',
          addressdetails: 1,
          limit,
        },
        headers: {
          // Nominatim requiert un User-Agent identifiable
          'User-Agent': 'EventEaseApp/1.0 (https://eventease.local)',
        },
      });

      const results = Array.isArray(response.data) ? response.data : [];

      return results.map((item: any, index: number) => {
        const displayName = item.display_name || '';
        const parts = displayName.split(',').map((p: string) => p.trim());
        const title = parts[0] || displayName;
        const subtitle = parts.slice(1).join(', ');
        return {
          id: item.place_id?.toString() || `${Date.now()}_${index}`,
          title,
          subtitle,
          displayName,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
        };
      });
    } catch (error) {
      console.error('Erreur autocomplétion (placesService):', error);
      return [];
    }
  },
};


