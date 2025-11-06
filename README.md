<<<<<<< HEAD
# ClgMart

## ✨Live Link : https://parth11-c.github.io/PortfolioWebsite/
# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.
# ClgMart — Campus Marketplace (Expo + React Native)

Modern mobile app to buy and sell items within your campus community. Built with Expo, React Native, Expo Router, TypeScript, and Supabase.

<p align="center">
  <img alt="ClgMart" src="https://img.shields.io/badge/Expo-54-000000?logo=expo&logoColor=white" />
  <img alt="React Native" src="https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=000" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=fff" />
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-2.x-3ECF8E?logo=supabase&logoColor=fff" />
</p>

---

## Overview
- Elegant, dark-themed UI optimized for mobile.
- File-based routing with `expo-router`.
- Supabase backend for data and auth; persistent sessions via `@react-native-async-storage/async-storage`.
- Messaging between users, product detail pages, and user profiles.
- Ready to run on iOS, Android, and Web via Expo.

The app source lives in the `collage/` directory and is configured as an Expo app named `travel` (renameable) with slug `travel`. Main entry uses `expo-router/entry`.

Key entry points and features:
- `collage/app/index.tsx` — Landing screen with CTA to sign-in.
- `collage/app/auth/_layout.tsx` — Auth stack layout (`index`, `sign-in`, `sign-up`).
- `collage/app/(tabs)/message.tsx` — Conversations list powered by Supabase `messages` table.
- `collage/app/post/[id].tsx` — Product detail with price badge and WhatsApp/contact shortcuts.
- `collage/app/profile/[id].tsx` — Public user profile and grid of user products.
- `collage/lib/supabase.ts` — Supabase client initialization, uses `EXPO_PUBLIC_SUPABASE_*` envs when provided.

---

## Features
- Messaging inbox with live updates using Supabase Realtime channels.
- Product detail screen with share, WhatsApp deep link (`wa.me`), and call actions.
- User profile screen with product grid and quick contact actions.
- Responsive design helpers in `collage/lib/responsive.ts`.
- Theming and safe-area support for a polished visual experience.

---

## Tech Stack
- Expo SDK 54 (`collage/app.json`)
- React Native 0.81, React 19
- Expo Router 6 (typed routes + React Compiler enabled)
- TypeScript (~5.9)
- Supabase JS (~2.57)
- Expo modules: Image, Image Picker, Haptics, Location, Web Browser, etc.

---

## Project Structure
```
ClgMart/
├─ README.md                      # You are here
└─ collage/                       # Expo app root
   ├─ app/                        # File-based routes
   │  ├─ index.tsx               # Landing screen
   │  ├─ auth/
   │  │  └─ _layout.tsx
   │  ├─ (tabs)/
   │  │  └─ message.tsx          # Conversations tab
   │  ├─ post/
   │  │  └─ [id].tsx             # Product details
   │  └─ profile/
   │     └─ [id].tsx             # User profile
   ├─ lib/
   │  ├─ responsive.ts           # Responsive helpers
   │  └─ supabase.ts             # Supabase client
   ├─ store/                     # App state (Zustand or custom store)
   ├─ theme/                     # Theme primitives (if any)
   ├─ app.json                   # Expo config
   ├─ package.json               # Scripts and deps
   ├─ tsconfig.json              # TS config
   └─ eslint.config.js
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+ (or pnpm/yarn)
- Expo CLI (optional) — `npm i -g expo-cli`

### 1) Clone and install
```bash
# Clone
git clone <your-repo-url> && cd ClgMart/collage

# Install deps
npm install
```

### 2) Configure environment variables (Supabase)
Create a `.env` (or `.env.local`) in `collage/` and add:
```bash
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Notes:
- The current `collage/lib/supabase.ts` contains default values and a comment: "For production, move these to EXPO_PUBLIC_* env vars." Ensure you set the env vars above for staging/production builds.
- Never commit private service keys.

### 3) Run the app
```bash
# From ClgMart/collage
npm start           # start metro and dev server
npm run android     # run on Android emulator/device
npm run ios         # run on iOS simulator/device
npm run web         # run on web
```

Expo will provide a QR code and options to launch on devices/simulators.

---

## Available Scripts (`collage/package.json`)
- `start` — `expo start`
- `android` — `expo start --android`
- `ios` — `expo start --ios`
- `web` — `expo start --web`
- `lint` — `expo lint`
- `reset-project` — Reset starter code scaffolding

---

## Configuration Highlights
- `collage/app.json`
  - `name` and `slug`: currently `travel` (you can rename to `clgmart`).
  - iOS permissions for Camera, Photo Library, and Location.
  - Android adaptive icons and edge-to-edge UI.
  - Plugins: `expo-router`, `expo-splash-screen` with light/dark backgrounds.
  - Experiments: `typedRoutes: true`, `reactCompiler: true`.

- `collage/tsconfig.json`
  - Extends `expo/tsconfig.base`.
  - Path aliases for `@/*` and `expo-router/*` types.

---

## Security & Environment
- Provide `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` via environment variables for non-local builds.
- Prefer secure storage and backend checks for any sensitive operations.

---

## Roadmap Ideas
- Add listing creation flow with image upload to Supabase Storage.
- Favorites and saved searches.
- Push notifications for new messages.
- Moderation and reporting.
- Payments or escrow integration for transactions.

---

## Contributing
- Fork the repo and create a feature branch.
- Keep PRs small and focused.
- Run `npm run lint` and ensure no TypeScript errors before proposing changes.

---

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
>>>>>>> 6498594 (Initial commit)
