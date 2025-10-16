import axios from 'axios';
import Constants from 'expo-constants';
import appJson from '../../app.json';
/**
 * Weather Service (OpenWeather)
 * - getWeatherByCity / getWeatherByCoords: météo actuelle
 * - getWeatherForEvent: météo en fonction de la date (courant ou prévision ≤ 5j)
 * Lit la clé API depuis app.config.js -> extra.openWeatherApiKey
 */

// Lecture de la clé depuis la config Expo (app.config.js -> extra.openWeatherApiKey)
const API_KEY =
  (Constants?.expoConfig as any)?.extra?.openWeatherApiKey ||
  (Constants as any)?.manifest?.extra?.openWeatherApiKey ||
  // app.json may not have extra at runtime; guard with any
  ((appJson as any)?.expo?.extra?.openWeatherApiKey) ||
  '';

const BASE_URL = 'https://api.openweathermap.org/data/2.5';

type WeatherData = {
  temp: number;
  description?: string;
  icon?: string;
  humidity?: number;
  windSpeed?: number;
} | null;

export const weatherService = {
  // Météo courante par ville
  async getWeatherByCity(city: string): Promise<WeatherData> {
    try {
      if (!API_KEY) return null;
      if (!city) return null;

      const response = await axios.get(`${BASE_URL}/weather`, {
        params: {
          q: city,
          appid: API_KEY,
          units: 'metric',
          lang: 'fr',
        },
      });

      return {
        temp: Math.round(response.data.main?.temp),
        description: response.data.weather?.[0]?.description,
        icon: response.data.weather?.[0]?.icon,
        humidity: response.data.main?.humidity,
        windSpeed: response.data.wind?.speed,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la météo:', error);
      return null;
    }
  },

  // Météo courante par coordonnées
  async getWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
    try {
      if (!API_KEY) return null;
      if (lat == null || lon == null) return null;

      const response = await axios.get(`${BASE_URL}/weather`, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: 'metric',
          lang: 'fr',
        },
      });

      return {
        temp: Math.round(response.data.main?.temp),
        description: response.data.weather?.[0]?.description,
        icon: response.data.weather?.[0]?.icon,
        humidity: response.data.main?.humidity,
        windSpeed: response.data.wind?.speed,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la météo:', error);
      return null;
    }
  },

  // Météo pour une date d'événement (aujourd'hui = /weather, futur ≤ 5 jours = /forecast)
  async getWeatherForEvent({ eventDateISO, city, lat, lon }: { eventDateISO: string; city?: string; lat?: number | null; lon?: number | null; }): Promise<WeatherData> {
    try {
      const eventDate = new Date(eventDateISO);
      const now = new Date();
      if (!API_KEY) return null;
      if ((lat == null || lon == null) && !city) return null;

      const dayDiff = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // 1) Événement aujourd'hui ou passé proche → météo courante
      if (dayDiff <= 0) {
        if (lat != null && lon != null) {
          return await this.getWeatherByCoords(lat, lon);
        }
        if (city) {
          return await this.getWeatherByCity(city);
        }
        return null;
      }

      // 2) Événement dans ≤ 5 jours → prévisions 5 jours / 3 heures
      if (dayDiff <= 5) {
        const params: any = {
          appid: API_KEY,
          units: 'metric',
          lang: 'fr',
        };
        if (lat != null && lon != null) {
          params.lat = lat;
          params.lon = lon;
        } else if (city) {
          params.q = city;
        } else {
          return null;
        }

        const response = await axios.get(`${BASE_URL}/forecast`, { params });
        const list = response.data?.list || [];
        if (!list.length) return null;

        // Choisir le créneau le plus proche de l'heure de l'événement
        const targetTs = eventDate.getTime();
        let best = list[0];
        let bestDiff = Math.abs(best.dt * 1000 - targetTs);
        for (const item of list) {
          const diff = Math.abs(item.dt * 1000 - targetTs);
          if (diff < bestDiff) {
            best = item;
            bestDiff = diff;
          }
        }

        return {
          temp: Math.round(best.main.temp),
          description: best.weather?.[0]?.description || 'Prévision',
          icon: best.weather?.[0]?.icon || '01d',
          humidity: best.main.humidity,
          windSpeed: best.wind.speed,
        };
      }

      // 3) Événement au-delà de 5 jours → pas de prévision gratuite
      return null;
    } catch (error) {
      console.error("Erreur lors de la récupération de la météo de l'événement:", error);
      return null;
    }
  },

  getWeatherIconUrl(iconCode: string) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  },
};
