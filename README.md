# Tagmark v2.4 Final — Supabase single-file sync

This build preserves the existing Tagmark v2.3 application/data features and adds the Supabase single-file sync layer.

## Included
- Existing Tagmark bookmark, tag, profile, character, category, filter, import/export and local IndexedDB behavior is retained.
- IndexedDB remains the immediate local store.
- Supabase PostgreSQL stores one fixed record per authenticated user: `tagmark_main`.
- Supabase Realtime receives INSERT/UPDATE changes on that record.
- Email/password authentication.
- Initial local/cloud reconciliation with protection for newer local edits.
- Automatic upload after local changes (debounced ~0.7s).
- Automatic retry/reconciliation when the browser comes back online.
- Manual Cloud Push / Cloud Pull controls.

## Supabase setup
1. Open the Supabase project used by this build.
2. Run the entire `supabase-tagmark.sql` in **SQL Editor → New query → Run**.
3. Ensure **Authentication → Providers → Email** is enabled.
4. Replace the GitHub Pages `index.html` with the included `index.html`.

The Project URL and Publishable key supplied for this project are already embedded in `index.html`.

## Sync model
Local changes are written to IndexedDB first. If signed in, the complete Tagmark JSON snapshot is then upserted to the user's fixed `tagmark_main` record. Other signed-in devices subscribe to that row through Supabase Realtime and replace their local snapshot when a newer remote version arrives.

This intentionally uses one JSON record because the requested model is a single fixed cloud file. A future record-level sync can reduce payload size and provide finer conflict merging if the bookmark collection becomes very large.

## Security
Only the Supabase Publishable key is embedded in the browser. The SQL enables RLS so authenticated users can access only rows whose `user_id` matches `auth.uid()`. Never put a Supabase Secret/service_role key in `index.html`.
