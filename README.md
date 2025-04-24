# Gdzie jest kosz

## Backend project

This app uses Nest.js based backend as a Trash Bin database. It is located [here](https://github.com/patryk-bernasiewicz/gdzie-jest-kosz-backend).

## Project description

A mobile app that allows users to track their location in real-time using Leaflet map and see the trash bins added by them, or their community, in their area. It aims to solve the problem that lots of dog owners have during their walks, when the need comes to dispose of the dog poop, and trash bins are nowhere in the vicinity.

## Technology stack

- React Native with Expo
- TypeScript
- Leaflet (maps)
- Clerk (authentication)
- Jotai (state management)
- React Query (@tanstack/react-query)
- Testing Library for React Native

## Project structure

```text
- app/           # App entry points, navigation, and screens
- components/    # Reusable UI and map components
  - ui/          # UI primitives (buttons, text, input, etc.)
  - map/         # Map and map-related components (Leaflet integration, context menu, debug tools)
- constants/     # App-wide constants (e.g., color palette)
- hooks/         # Custom React hooks (data fetching, geolocation, authentication, etc.)
  - __test__/    # Tests for hooks
- lib/           # Utility functions and API logic
- store/         # State management atoms (Jotai)
- types/         # TypeScript type definitions
- assets/        # Fonts and images
- scripts/       # Project scripts (e.g., reset-project.js)
```

## Setup instructions

1. Clone the repository.
2. Run npm install.
3. Set up your .env file with the required environment variables (see `.env.example`).
4. Start the backend project (see [the backend](https://github.com/patryk-bernasiewicz/gdzie-jest-kosz-backend) repo).
5. Run the app with `npx expo start`.

## Testing

After installing the dependencies, use `npm run test` to run the test suites.

## Features

- Real-time location tracking
- Real-time trash bin tracking in the user’s area
- User authentication with Clerk
- Map integration using Leaflet and OpenStreetMap
- Context menu for submitting new bin locations
- Admin features (e.g., marking bins as invalid)
