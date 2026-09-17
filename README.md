# Tagmark Local v1.7

Local-first bookmark manager PWA.

## v1.7 changes
- Profile tab redesigned into bookmark-style profile cards: name, tag category, series, and pre-registered tags.
- Profiles are grouped into series folders.
- Profile-derived character tags remain stored as `character:` / `cast:` name-only tags; profile metadata is used to auto-apply series and pre-registered tags.
- Main search provides suggestions from pre-registered tags.
- Bookmark tags and character-assigned tags are unified in the bookmark's tag area; character-assigned tags remain expandable under each character.
- Selecting a profile now also reflects its saved series/pre-registered tags in the bookmark tag set.

## Storage
Data is stored locally in IndexedDB in the browser. No server/database is required for this version.

## GitHub Pages
For branch-based GitHub Pages, put `index.html` at the root of the publishing folder (not inside the ZIP's containing folder).
