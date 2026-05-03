<div align="center">
  <img src="./assets/images/logo.png" alt="Betting App logo" width="220" />
</div>

# Betting App

A mobile app (**Expo / React Native**) for **friendly betting** among a small group using **play money points**, a **leaderboard**, and persistence via **Supabase** (PostgreSQL, auth, storage).

**Current version: `0.1.0`** — first tracked release of the project.

## Prerequisites

- Node.js (LTS recommended)
- A [Supabase](https://supabase.com) account and project configured for the app
- For native builds: [EAS CLI](https://docs.expo.dev/build/introduction/) and an Expo account

## Install

```bash
npm install
```

## Configuration

Copy environment variables:

```bash
cp .env.example .env
```

Set the following in `.env`:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_KEY`

(Find these in your Supabase project settings.)

## Development

```bash
npm start
# then pick iOS, Android, or a dev client depending on your setup
```

Useful scripts:

| Script | Purpose |
|--------|---------|
| `npm run android` / `npm run ios` | Local native run |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Jest tests |
| `npm run static:test` | typecheck + lint + Prettier check |

## Stack (overview)

- **Expo SDK 54**, **Expo Router** (typed routes)
- **TypeScript**, **TanStack Query**
- **Onion** architecture (domain / use cases at the core) — see `architecture-betting-app.html` for the visual overview

## Release `v0.1.0`

Initial baseline: friendly betting flows, Supabase integration, main screens; unit tests and CI workflow (`.github/workflows/ci.yml`).

After you have verified everything:

```bash
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0
```

Production builds: `production` / `preview` profiles in `eas.json`; see [EAS Build](https://docs.expo.dev/build/introduction/).

## License

Private project (`private: true` in `package.json`).
