# Tagmark Local v1.5

Latest local bookmark manager based on the previous Tagmark Local version.

## Included changes
- Artist / Series / Language are displayed as subtitle-like metadata on bookmark cards and omitted from the general tag-chip area.
- Character / Cast have dedicated workspace pages.
- Artist has a dedicated workspace page.
- Registered tags are grouped into collapsible type folders in Tag Management.
- Character/Cast tags use cyan text rather than a filled chip in bookmark-card identity display.
- Character editor no longer asks for a name or count; identity comes from Character/Cast registered tags.
- Character/Cast role is selected with radio buttons.
- Untagged characters are displayed as Male 1, Male 2, Female 1, etc.
- Character-dependent tags are assigned separately and shown with the normal tag group when the character name is clicked.
- One click on “Add character” creates exactly one character entry.
- Character/Cast registered tags can automatically apply their linked Series tag.
- Existing local IndexedDB data remains the source of truth; old character records are normalized when edited.
- URL is not displayed on bookmark cards.

## Data
This version remains local-only and stores bookmark metadata in IndexedDB. No bookmark page contents are uploaded.
