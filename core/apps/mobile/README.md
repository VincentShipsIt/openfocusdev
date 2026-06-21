# TaskFlow Mobile

## Setup
1. Copy `.env.example` to `.env.local`
2. Fill in:
   - `EXPO_PUBLIC_API_URL=https://api.todo.shipshit.dev` (when API is deployed)
   - `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y3J1Y2lhbC1naXJhZmZlLTEuY2xlcmsuYWNjb3VudHMuZGV2JA`

## Build for iPhone (no TestFlight needed)
```bash
cd core/apps/mobile
bun install
eas login  # your Expo account
eas build --platform ios --profile preview
```
The build will generate a QR code to install directly on your device.
