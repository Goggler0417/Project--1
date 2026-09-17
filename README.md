# Tagmark v2.5 Final — merge-only Supabase sync

## What changed
- Existing Tagmark v2.4 functionality is preserved.
- Cloud sync is now **merge-only**: sync never deletes existing local or cloud bookmarks, tags, or categories.
- A bookmark is merged by ID when possible, otherwise by normalized URL.
- Tags are unioned; non-empty notes/metadata are preserved rather than discarded.
- Categories are canonicalized by category path so category IDs created on different devices can be reconciled.
- Orphan `categoryId` values are repaired from `categoryPath`/category name during refresh/import.
- Manual Cloud Pull also merges instead of replacing the current device.
- Realtime INSERT/UPDATE events merge into the current device instead of replacing its database.

## Supabase setup
1. Run `supabase-tagmark.sql` once in Supabase SQL Editor.
2. Keep Email authentication enabled.
3. Replace the GitHub Pages `index.html` with the included `index.html`.

The supplied Supabase Project URL and Publishable key are already embedded.

## Important behavior
This version intentionally does not propagate deletions. If a bookmark is removed from one device, the next sync will not remove it from other devices or the cloud. This is intentional to prevent accidental data loss while the sync model is being stabilized.

Supabase Realtime still needs `tagmark_files` in the `supabase_realtime` publication and RLS must allow the authenticated user to read the row.
