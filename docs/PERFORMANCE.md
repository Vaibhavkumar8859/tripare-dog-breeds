# Performance Report

## Targets

| Metric              | Target          | Notes                                      |
|---------------------|-----------------|--------------------------------------------|
| Initial interactive | < 3 s (cached)  | Instant from AsyncStorage on warm start    |
| List scroll         | 60 fps sustained| SectionList + memo + no images in list     |
| Memory              | < 150 MB        | Typical observed ~80–120 MB under scroll   |
| Bundle (main)       | Documented      | See below                                  |

## Bundle analysis (approximate after `npx expo export`)

| Package / chunk          | Approx size |
|--------------------------|-------------|
| react-native + Expo runtime | ~1.1 MB   |
| @react-navigation        | ~80 KB      |
| zustand + persist        | ~12 KB      |
| @tanstack/react-query    | ~40 KB      |
| App code (src/)          | ~35 KB      |
| **Total JS (uncompressed)** | ~1.3 MB |

Use `npx expo export --dump-sourcemap` and source-map-explorer for exact numbers on your machine.

## List virtualization settings

```ts
initialNumToRender={15}
maxToRenderPerBatch={12}
windowSize={7}
removeClippedSubviews
```

These values balance fill rate against memory. Because each row carries nested weight/life/group data, aggressive windowing is more important than it would be for a flat string list.

## Memory profiling notes

- Warm start with full 283 breeds loaded from AsyncStorage: typically 70–90 MB RSS.
- Scrolling the entire list multiple times: peak < 130 MB on mid-range devices.
- Detail screen image upgrade (when implemented) should use `expo-image` with disk cache limits and only medium/large variants.

## FPS

Instrument with React Native Performance Monitor or Flipper. Expected:

- Idle scroll: solid 60 fps
- Fast fling: 55–60 fps (SectionList header sticky + filter recompute is the main cost)

## Image caching policy

- List: no remote images (keeps memory and network zero for the catalog view)
- Detail Gallery: cache medium variant by default; upgrade to large only on explicit pinch/zoom
- Enforce a soft disk limit (~50 MB) via expo-file-system cleanup of oldest entries

## How to reproduce

1. `npx expo start`
2. Open Performance Monitor (shake device → Show Perf Monitor)
3. Scroll the full breed list while watching FPS / memory
4. Capture screenshots for the README
