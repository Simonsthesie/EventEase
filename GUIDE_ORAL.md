### EventEase — Guide oral (architecture, choix, démo, tests)

#### 1) Contexte et objectif (30s)
- Prototype d’application mobile pour une association, en 4 jours.
- Fonctions clés: Auth locale, liste/CRUD d’événements, participation, persistance locale.
- Bonus intégrés: Calendrier, météo (OpenWeather), géolocalisation + distance, thème + icônes.

#### 2) Stack et raisons des choix (30s)
- React Native + Expo: dev rapide, outillage complet, déploiement simple.
- React Navigation: navigation standard (stack), conditionnelle avec auth.
- AsyncStorage: persistance locale simple suffisante pour un POC.
- OpenWeather: API publique, facile à intégrer; fallback démo si pas de clé.
- expo-location: permissions + GPS, cross‑platform.

#### 3) Architecture du code (1 min)
- `App.js`: point d’entrée, providers (AuthProvider, EventProvider), NavigationContainer.
- `src/navigation/AppNavigator.js`: stack; si pas d’utilisateur → `Login`, sinon `EventList`, `EventForm`, `EventDetails`, `Calendar`.
- `src/contexts/`:
  - `AuthContext.js`: session utilisateur, login/register/logout (stockage local)
  - `EventContext.js`: liste d’événements, CRUD, toggle participation, persistance
- `src/services/`:
  - `storageService.js`: lecture/écriture AsyncStorage (événements, utilisateurs, session)
  - `authService.js`: auth locale (sans backend) en s’appuyant sur `storageService`
  - `weatherService.js`: OpenWeather (météo actuelle ou prévision ≤ 5j), clé lue dans `app.config.js`
  - `locationService.js`: permissions, position, distance (Haversine)
- `src/screens/`:
  - `LoginScreen.js`: inscription/connexion + validation
  - `EventListScreen.js`: liste, filtres (tous/à venir/participés), actions rapides
  - `EventFormScreen.js`: création/édition, date/heure en popup, position
  - `EventDetailsScreen.js`: détails + météo + ouvrir Maps + participer
  - `CalendarScreen.js`: calendrier (react-native-calendars) + liste du jour
- `src/components/`: composants UI (Button, Input, EventCard, EmptyState, Loading, WeatherCard)
- `src/utils/`: `theme`, `validation`, `dateUtils`

#### 4) Modèle de données (30s)
- Utilisateur (POC): `{ id, name, email, password, createdAt }` (mot de passe en clair uniquement pour démo locale)
- Événement: `{ id, title, description, date: ISO, location?, latitude?, longitude?, participated, createdAt, updatedAt? }`

#### 5) Flux principaux (1 min)
- Auth:
  1) Register/Login en local → `authService` → `storageService.saveCurrentUser()`
  2) Navigation conditionnelle via `AppNavigator` selon `user`.
- CRUD Événements:
  1) Création/édition depuis `EventFormScreen`
  2) `EventContext` persiste via `storageService.saveEvents()`
  3) Suppression depuis la carte ou l’écran Détails
  4) Toggle participation sur la carte ou Détails
- Météo:
  1) `EventDetailsScreen` → `weatherService.getWeatherForEvent(...)`
  2) Aujourd’hui: météo courante; ≤5 jours: prévision; sinon message « indisponible »
  3) Fallback démo si pas de clé → pas de blocage en démo
- Géolocalisation et distance:
  1) En Form, bouton « Utiliser ma position »
  2) Distance calculée (Haversine) et affichée dans la liste si dispo
  3) Bouton « Ouvrir dans Maps » (schémas iOS/Android)

#### 6) Qualité et conventions (30s)
- ESLint + Prettier configurés; commandes npm:
  - `npm run lint` / `npm run lint:fix`
  - `npm run format` / `npm run format:check`
- Hooks `useEffect` corrigés (dépendances complètes via `useCallback`).
- Services/contexts JSDoc courts; écrans commentés en en‑tête.

#### 7) Intégration OpenWeather (30s)
- Clé: `app.config.js` → `extra.openWeatherApiKey`
- Démarrage: si clé vide → mode démo (valeurs par défaut) pour sécuriser la démo.
- Icônes météo via `weatherService.getWeatherIconUrl(icon)`.

#### 8) Splash et icônes (20s)
- Fichier image: `assets/eventease.png`
- Config: `app.config.js` → `icon`, `splash.image`, `android.adaptiveIcon`, `web.favicon`
- Remarque: le splash personnalisé s’affiche en build native (dev build/standalone), pas dans Expo Go.

#### 9) Démo (script 2–3 min)
1) Ouvrir l’app → si pas connecté, `LoginScreen`.
2) S’inscrire (nom/email/mot de passe) → redirection vers la liste.
3) Créer un événement: titre, description, date/heure (popup), lieu ou position.
4) Retour liste: voir la carte, filtrer (À venir / Participés), participer (toggle).
5) Ouvrir Détails: description, lieu, bouton Maps, météo (clé ou fallback).
6) Ouvrir Calendrier: points sur les dates, sélectionner une date → liste du jour.

#### 10) Tests (manuels et pistes unitaires) (1 min)
- Check-list manuelle:
  - Auth: inscription → déconnexion → connexion
  - CRUD: créer, modifier, supprimer; persistance après relance
  - Participer: toggle et badge « Participé »
  - Filtres liste: Tous, À venir, Participés
  - Calendrier: marqueurs et liste du jour sélectionné
  - Météo: avec clé (temps réel) et sans clé (fallback); dates >5 jours → message
  - Localisation: permission, position enregistrée, bouton Maps
- Pistes unitaires (si temps):
  - `dateUtils` (format, today/future/past)
  - `validation` (email, password, titre/description/date)
  - `locationService.calculateDistance`

#### 11) Limitations et améliorations (30s)
- POC: mots de passe en clair → à remplacer par backend + hash (bcrypt) en prod.
- Pas de sync cloud; AsyncStorage suffit en démo.
- Améliorations rapides: mode sombre, notifications locales (rappels), recherche/tri avancés, import/export JSON, profil utilisateur.

#### 12) Commandes utiles (15s)
```bash
# Démarrer
npm start

# Dev build (voir splash natif)
npx expo run:ios
npx expo run:android

# Lint & format
npm run lint:fix
npm run format
```

#### 13) Points à valoriser à l’oral (30s)
- Robustesse: fallback météo sans clé → démo non bloquée.
- UX: sélection date/heure simplifiée en popup; SafeArea en-tête.
- Code: contexts/services séparés, utils centralisés, qualité (ESLint/Prettier), hooks propres.
- Scalabilité: facile d’ajouter un backend, des tests, des features (notifications, catégories, etc.).


