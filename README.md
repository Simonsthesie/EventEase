# EventEase (Expo • React Native)

Démarrez l’application mobile en quelques minutes.

## 1) Prérequis
- Node.js ≥ 16, npm ≥ 8 (ou yarn)
- Expo CLI (via npx)
- Smartphone avec Expo Go (iOS/Android) ou simulateur/émulateur

## 2) Installation
```bash
npm install
```

## 3) Lancer en développement
- Avec Expo Go (recommandé pour un démarrage rapide):
```bash
npm start
# Scanner le QR code (Caméra iOS / Expo Go Android)
```
- Sur un simulateur/émulateur (dev build natif):
```bash
npm run ios      # iOS (Xcode requis)
npm run android  # Android (Android Studio requis)
```

## 4) Scripts utiles
```bash
npm start          # Expo dev server
npm run ios        # Dev build iOS
npm run android    # Dev build Android
npm run lint       # Linter
npm run lint:fix   # Linter + corrections auto
npm run format     # Formatage Prettier
```

## 5) Configuration (.env)
- Créez un fichier `.env` à la racine:
```
OPENWEATHER_API_KEY=VOTRE_CLE_ICI
```
- La clé est injectée dans `app.config.js` via `dotenv` (dev) et peut être fournie via variables EAS en CI/build.
- Redémarrez avec vidage du cache pour prendre en compte les changements de config:
```
npx expo start -c
```