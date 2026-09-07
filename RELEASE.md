# RaevynShelf v1.0 release-candidate checklist

## Must pass before public launch

- [ ] `npm install` completes and a package lockfile is committed.
- [ ] `npm run build` succeeds from a clean checkout.
- [ ] Supabase production project is created.
- [ ] `supabase/schema.sql` is applied successfully.
- [ ] Google OAuth provider is configured with exact production redirect URLs.
- [ ] Netlify has `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as server-only secrets.
- [ ] Frontend has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`/publishable key.
- [ ] `VITE_KOFI_URL` points to the real RaevynShelf Ko-fi page.
- [ ] A fresh user can sign in, sign out, and sign back in.
- [ ] User A cannot query or mutate User B's library, works, tags, or cards.
- [ ] AO3 import rejects unauthenticated requests.
- [ ] AO3 import works for a normal public work, an adult-rated work, a missing/deleted work, and a rate-limited response.
- [ ] AO3 import does not request or store an AO3 password.
- [ ] Publishing a stat card exposes only display name/theme/statistics snapshot.
- [ ] Disabling a stat card makes its public URL unavailable.
- [ ] Account deletion removes auth account and cascades private application rows.
- [ ] Privacy page matches the actual production analytics configuration.
- [ ] Analytics never receive work titles, AO3 URLs/IDs, tags, stat-card tokens, email addresses, or route URLs containing share tokens.
- [ ] Mobile tests pass on current Safari/Chrome and desktop Chrome/Firefox/Safari.
- [ ] `/s/:token`, `/privacy`, `/about`, auth redirects, and deep links work after direct refresh on Netlify.
- [ ] Custom domain/HTTPS is live.
- [ ] Error monitoring/logging is configured without logging private library payloads.

## Recommended before announcing widely

- [ ] Test with 5–20 beta users.
- [ ] Add a contact/support address to About/Privacy.
- [ ] Have privacy/terms copy reviewed for the jurisdictions you intend to serve.
- [ ] Add basic rate limiting/abuse monitoring for AO3 import at the platform layer.
- [ ] Confirm your AO3 fetching behavior remains respectful of AO3's current policies and rate limits.
