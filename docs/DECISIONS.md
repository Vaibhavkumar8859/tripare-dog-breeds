# Technical Decisions

## State management – Zustand

**Why:** Smallest runtime cost, excellent TypeScript support, first-class `persist` middleware that works cleanly with AsyncStorage. Redux Toolkit would add ~40 kB and boilerplate for a single domain (breeds + groups). Context+Reducer becomes painful once you need selective subscriptions for the list.

Normalized shape: flat `breeds[]` + `groups[]` keyed by id relationships. No nested entity store needed for this data volume.

## Persistence – AsyncStorage (via Zustand persist)

**Why:** 283 breed records + 9 groups is well under a few hundred KB of JSON. SQLite / WatermelonDB would add native modules, schema migrations, and complexity with no measurable benefit for this dataset. AsyncStorage is already present in Expo and is sufficient for offline-first read/write of the entire catalog.

Schema is intentionally denormalized JSON blobs under a single key (`dog-breeds-v1`). Versioned key allows future migrations.

## API client – custom hooks + withRetry

**Why:** React Query is included for future detail enrichment, but the primary catalog load is a one-shot “fetch all 6 pages and merge” operation that fits better in the Zustand store. Parallel `Promise.all` of the 6 pages avoids sequential waterfall. Exponential backoff (400 ms base) handles flaky networks without extra libraries.

## List performance trade-off

Each breed row is richer than a flat record (nested traits, weight ranges, group relationship). The critical performance work is therefore **payload richness per row**, not raw row count:

- SectionList with `windowSize={7}`, `removeClippedSubviews`, `initialNumToRender={15}`
- No images in the list row (thumbnails deferred to detail)
- Memoized `BreedCard`
- Debounced search (300 ms) so filter recalculation does not run on every keystroke

This keeps sustained 60 fps while still shipping the full 283-record dataset.

## Filters

Size bands are derived client-side from average of male/female weight ranges:

| Band   | Avg weight (kg) |
|--------|-----------------|
| small  | < 10            |
| medium | 10 – 25         |
| large  | 25 – 40         |
| giant  | ≥ 40            |

Coat length and full trait-threshold UI are scaffolded; the API surface for coat is limited, so only the most reliable filters (group, size, hypoallergenic) are fully wired.

## Navigation

React Navigation native stack with full TypeScript param lists. Expo Router was considered but native stack gives more explicit control for the two-screen flow and is easier to test.
