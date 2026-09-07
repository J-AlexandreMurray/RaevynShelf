# RaevynShelf v1 — AO3 import slice

RaevynShelf is an AO3-only, private reading companion. The user library remains private; only an explicitly generated stat-card snapshot can become public.

## Included now

- React + Vite application
- Supabase Google OAuth foundation
- PostgreSQL schema with row-level security
- Private works library
- AO3 work URL importer backed by a Netlify serverless function
- Conservative public metadata extraction: title, creator, words, AO3 rating, fandoms, relationships, characters, additional tags, language and dates where available
- User-owned reading state and rating kept separately from AO3 metadata
- Existing dashboard/statistics flow uses the imported work data
- Public stat-card RPC exposes only a stored snapshot, not the user's library

## AO3 integration boundary

The app does **not** collect or proxy AO3 credentials. v1 imports public work metadata through a server-side function. The importer should remain conservative and must respect AO3 rate limiting/robots changes. Login-restricted works may not import through this path.

## Local setup

1. Create a Supabase project.
2. Enable Google in Authentication → Providers.
3. Add local and production OAuth redirect URLs.
4. Run `supabase/schema.sql` in Supabase.
5. Copy `.env.example` to `.env` and fill the Supabase URL + anon key.
6. Run `npm install`.
7. For full AO3 imports, run through Netlify Dev so `/api/ao3-work` resolves to the function.
8. Run the app.

## Next slices

1. Stat-card creation/update/disable UI.
2. Bulk import strategy (without AO3 credential proxying).
3. More AO3-native statistics: fandoms, ratings, word-count distributions and reading timeline.
4. Account/data deletion.
5. Landing site + privacy/terms copy.
6. Ko-fi support link.
7. Production QA and analytics audit.


## Stat-card sharing slice

This build now supports the intended privacy loop:

1. User saves a separate library display name.
2. User explicitly publishes a stat card.
3. The app snapshots only calculated statistics into `stat_cards.statistics_snapshot`.
4. The public `/s/:token` route fetches that snapshot through `get_public_stat_card`.
5. The private `works` and `libraries` rows remain protected by RLS.
6. User can refresh or disable the public card at any time.

The current implementation refreshes an existing active card instead of creating unlimited card versions.


## Release candidate status

This repository is now structured as a v1.0 release candidate, not a finished production release.

The code includes the primary v1 product loop: sign-in, private persistent shelf, authenticated AO3 public-metadata import, dashboard statistics, optional stat-card publishing, revocation, landing/about/privacy surfaces, Ko-fi placement, and permanent account deletion.

Before a public release, complete `RELEASE.md`. In particular, a clean dependency install/build must succeed, production OAuth/secrets must be configured, the database security policies must be verified with two real test users, and analytics/privacy behavior must be tested in the deployed environment.
