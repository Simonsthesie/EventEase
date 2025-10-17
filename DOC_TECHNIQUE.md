# EventEase — Documentation technique

## 1) Stack et versions
- Expo ~51, React Native 0.74, React 18, TypeScript (~5.3)
- Navigation: `@react-navigation/native` + `@react-navigation/native-stack`
- Persistance locale: `@react-native-async-storage/async-storage`
- Géolocalisation: `expo-location`
- Date/heure: `@react-native-community/datetimepicker`
- Calendrier: `react-native-calendars`
- HTTP: `axios`
- Outils: ESLint, Prettier

## 2) Architecture du code
- Point d’entrée: `App.tsx` (charge les fonts, monte les providers, navigation)
- Navigation: `src/navigation/AppNavigator.tsx` (stack; redirige selon l’auth)
- Contexts (state global):
  - `src/contexts/AuthContext.tsx`
  - `src/contexts/EventContext.tsx`
- Services (accès données/OS/API):
  - `src/services/authService.ts`
  - `src/services/storageService.ts`
  - `src/services/locationService.ts`
  - `src/services/placesService.ts`
  - `src/services/weatherService.ts`
- Écrans: `src/screens/*.tsx` (Login, EventList, EventForm, EventDetails, Calendar)
- Composants UI: `src/components/*.tsx` (Button, Input, EventCard, EmptyState, Loading, WeatherCard)
- Utilitaires: `src/utils/*.ts` (theme, validation, dateUtils)

Convention: architecture modulaire par responsabilités (Contexts / Services / Screens / Components / Utils / Navigation).

## 3) Cycle d’exécution (haut niveau)
1. `App.tsx`: charge les fonts; monte `AuthProvider` + `EventProvider`; `NavigationContainer` → `AppNavigator`.
2. `AuthContext` vérifie un utilisateur courant en AsyncStorage. Si `user` → pile principale; sinon → `Login`.
3. `EventContext` charge les événements et expose CRUD + `toggleParticipation`.
4. Les écrans consomment `useAuth()` / `useEvents()` pour lire/agir sur l’état.

## 4) Modèle de données
Type principal `EventItem` (défini dans `EventContext`):
```
{
  id: string;
  title: string;
  description: string;
  date: string;           // ISO
  location?: string;
  latitude?: number|null;
  longitude?: number|null;
  participated: boolean;
  createdAt: string;      // ISO
  updatedAt?: string;     // ISO
  distance?: string;      // ex: "850 m" ou "2.3 km"
}
```

## 5) Contexts (interfaces publiques)
- `AuthContext` (`src/contexts/AuthContext.tsx`):
  - `user: { id; name; email } | null`
  - `loading: boolean`
  - `login(email: string, password: string): Promise<{success: boolean; error?: string}>`
  - `register(name: string, email: string, password: string): Promise<{success: boolean; error?: string}>`
  - `logout(): Promise<void>`

- `EventContext` (`src/contexts/EventContext.tsx`):
  - `events: EventItem[]`
  - `loading: boolean`
  - `addEvent(eventData: Partial<EventItem>)`
  - `updateEvent(eventId: string, eventData: Partial<EventItem>)`
  - `deleteEvent(eventId: string)`
  - `toggleParticipation(eventId: string)`
  - `getEventById(eventId: string): EventItem | undefined`
  - `refreshEvents(): Promise<void>`

## 6) Services
- `authService`:
  - `login(email, password)`: lit `users` en local, vérifie, persiste `currentUser` sans mot de passe
  - `register(name, email, password)`: crée l’utilisateur local, démarre la session
  - `logout()`, `getCurrentUser()`

- `storageService` (AsyncStorage):
  - Clés: `@eventease_events`, `@eventease_users`, `@eventease_current_user`
  - `getEvents()/saveEvents()`, `getUsers()/saveUsers()`, `getCurrentUser()/saveCurrentUser()`

- `locationService` (expo-location):
  - `requestPermission()`
  - `getCurrentLocation(): { latitude, longitude }`
  - `calculateDistance(lat1, lon1, lat2, lon2)` (Haversine)
  - `formatDistance(km): string`

- `placesService` (Nominatim/OSM):
  - `search(query: string, limit=5): Promise<{ id; title; subtitle?; displayName; lat; lon }[]>`
  - Headers: `User-Agent` explicite (respect des CGU)

- `weatherService` (OpenWeather):
  - Lit la clé via `Constants.expoConfig.extra.openWeatherApiKey` (injectée depuis `.env` via `app.config.js`)
  - `getWeatherByCity(city)` / `getWeatherByCoords(lat, lon)`
  - `getWeatherForEvent({ eventDateISO, city?, lat?, lon? })`
  - Règles: pas d’API si pas de clé; pas d’affichage si pas de lieu/coords; pas de prévision > 5 jours (retourne `null`)

## 7) Écrans (rôles)
- `LoginScreen`: formulaire auth locale, validation basique (email, password, name)
- `EventListScreen`: liste + filtres, actions rapides, récupération position et distance
- `EventFormScreen`: création/édition; sélection date/heure; autocomplétion d’adresse; "utiliser ma position"
- `EventDetailsScreen`: détails, météo (si conditions OK), participation, Maps, suppression
- `CalendarScreen`: vue mensuelle, dates marquées, liste du jour

## 8) Composants & thème
- Composants: `Button`, `Input`, `EventCard`, `EmptyState`, `Loading`, `WeatherCard`
- `theme.ts` (export `as const`): palette, spacing, radius, sizes, weights, shadows
- Format date/heure: `dateUtils` (`formatShortDate`, `formatTime`, etc.)

## 9) Environnement & configuration
- `.env` (non commité, voir `.gitignore`):
  - `OPENWEATHER_API_KEY=...`
- `app.config.js` charge `.env` via `dotenv` et expose `extra.openWeatherApiKey`
- Redémarrage propre pour recharger la config: `npx expo start -c`

## 10) Gestion erreurs & limites
- Réseau/API: `weatherService` retourne `null` en cas d’erreur; UI affiche la météo uniquement si donnée présente
- Autocomplétion: debounce 350 ms (limiter les requêtes Nominatim)
- Géoloc: si permission refusée → pas de distance (silencieux côté UI)

## 11) Qualité & scripts
- ESLint: `npm run lint` (analyse), `npm run lint:fix`
- Prettier: `npm run format`, `npm run format:check`
- TypeScript: `npx tsc --noEmit` (compilation à blanc)

## 12) Lancer le projet
```
npm install
npx expo start -c
```
- Expo Go: scanner le QR; simulateur iOS/Android via Metro

## 13) Sécurité & confidentialité (POC)
- Auth locale sans chiffrement (POC). Pour aller plus loin: hash local du mot de passe, backend, tokens, SecureStore
- La clé OpenWeather doit rester hors repo (`.env`)

## 14) Extensions possibles
- Backend (API REST/GraphQL), sync multi-device
- Notifications, partages, rôles, commentaires
- Tests unitaires (utils/services) et E2E (Detox)
- Accessibilité, performance (mémoïsation, virtualization), i18n


