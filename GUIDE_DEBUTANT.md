## EventEase — Guide Débutant

Bienvenue ! Ce guide explique simplement comment fonctionne l’application (Expo React Native), où trouver quoi, et comment ajouter une petite fonctionnalité.

### 1) Vue d’ensemble
- **Point d’entrée (`App.js`)**: charge la police d’icônes, fournit les contextes `AuthProvider` (utilisateur) et `EventProvider` (événements), puis affiche la navigation.
- **Navigation (`src/navigation/AppNavigator.js`)**: affiche l’écran `Login` si l’utilisateur n’est pas connecté, sinon la pile principale: `EventList`, `EventForm`, `EventDetails`, `Calendar`.
- **Contexts**:
  - `src/contexts/AuthContext.js`: stocke `user`, expose `login`, `register`, `logout`, et recharge la session au démarrage.
  - `src/contexts/EventContext.js`: stocke `events`, expose CRUD (ajouter, modifier, supprimer), `toggleParticipation`, `getEventById`, et persiste les données.
- **Services**:
  - `authService`: login/register locaux via `AsyncStorage` (pas de backend).
  - `storageService`: lecture/écriture `AsyncStorage` (événements, utilisateurs, utilisateur courant).
  - `locationService`: permissions et géolocalisation (expo-location) + calcul de distance.
  - `weatherService`: météo (OpenWeather). Utilise la clé `extra.openWeatherApiKey` dans `app.config.js` ou variables d’environnement.
- **Écrans (`src/screens/`)**:
  - `LoginScreen`: connexion/inscription avec validation de base.
  - `EventListScreen`: liste, filtres, actions rapides, géolocalisation utilisateur et distances.
  - `EventFormScreen`: création/édition, sélection date/heure, position actuelle.
  - `EventDetailsScreen`: détails, météo, ouvrir dans Maps, participer/supprimer.
  - `CalendarScreen`: calendrier mensuel et événements du jour sélectionné.
- **Composants (`src/components/`)**: `Button`, `Input`, `EventCard`, `EmptyState`, `Loading`, `WeatherCard` (réutilisables et stylés avec `theme`).
- **Utilitaires (`src/utils/`)**: `theme` (couleurs/espacements), `validation` (helpers), `dateUtils` (formats et comparaisons).

### 2) Cycle de vie simplifié
1. L’appli démarre dans `App.js` → monte `AuthProvider` et `EventProvider` → `NavigationContainer` → `AppNavigator`.
2. `AuthContext` vérifie un utilisateur sauvegardé. Si présent → on voit la pile principale, sinon → `Login`.
3. `EventContext` charge les événements depuis `AsyncStorage`. Les modifications (ajout/modif/suppression/participation) sont persistées immédiatement.
4. Les écrans consomment ces contextes via `useAuth()` et `useEvents()` pour lire/agir sur l’état.

### 3) Données et persistance
- Pas de serveur: tout est local via `AsyncStorage`.
- Clés utilisées: `@eventease_events`, `@eventease_users`, `@eventease_current_user`.
- Un événement ressemble à: `{ id, title, description, date ISO, location?, latitude?, longitude?, participated, createdAt, updatedAt? }`.

### 4) Météo et configuration
- `weatherService` utilise l’API OpenWeather.
- Renseignez votre clé dans `app.config.js` → `expo.extra.openWeatherApiKey`, ou via variables d’environnement (EAS).
- Sans clé, des valeurs de démonstration sont renvoyées pour éviter les blocages.

### 5) Géolocalisation
- `locationService` demande la permission, récupère la position, calcule et formate des distances (Haversine).
- Les permissions iOS/Android sont déjà configurées dans `app.config.js`.

### 6) Styles et UX
- Le thème commun (`src/utils/theme.js`) centralise couleurs, espacements, arrondis, tailles de texte, ombres.
- Les composants UI utilisent ce thème pour une apparence cohérente.

### 7) Ajouter une fonctionnalité — Exemples pas à pas

#### A. Nouveau champ « catégorie » sur un événement
1. Dans `EventFormScreen`, ajoutez un `Input` pour `category` dans l’état `formData` et dans l’UI; incluez-le dans `eventData` lors de la sauvegarde.
2. Dans `EventContext.addEvent` et `updateEvent`, aucune logique spéciale n’est requise: les champs supplémentaires sont persistés tels quels.
3. Affichez la catégorie dans `EventCard` et `EventDetailsScreen` si présente.

#### B. Filtrer par « participés » sur la liste
- Déjà présent via l’état `filter` dans `EventListScreen` (valeurs: `all`, `upcoming`, `participated`). Il suffit de sélectionner l’onglet.

#### C. Activer la météo réelle
1. Obtenez une clé OpenWeather.
2. Mettez-la dans `app.config.js` → `expo.extra.openWeatherApiKey`.
3. Redémarrez l’app (ou rebuild) pour recharger la config.

### 8) Démarrer le projet
- Prérequis: Node.js, Expo CLI, simulators (iOS/Android) ou un appareil avec Expo Go.
- Commandes utiles:
  - `npm install`
  - `npx expo start`
  - Scanner le QR avec Expo Go ou lancer iOS/Android depuis la page Metro bundler.

### 9) Où regarder pour comprendre vite
- Flux utilisateur: `App.js` → `AppNavigator` → `Login` → `EventList` → `EventDetails`/`EventForm`/`Calendar`.
- État global: `AuthContext` et `EventContext`.
- Données: `storageService`.
- Intégrations: `locationService`, `weatherService`.

Bon développement ! N’hésitez pas à lire le code des écrans: il est structuré et commenté de façon concise.


