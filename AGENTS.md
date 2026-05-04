# Garden Planner — Agent Guide

## Project overview

React + TypeScript PWA for planning and managing a family vegetable garden (~20 acres / 40×50 m default). Runs fully offline; data lives in IndexedDB via Dexie.js. The canvas (Fabric.js) is the primary interaction surface.

## Dev commands

```bash
npm install        # install deps
npm run dev        # dev server (http://localhost:5173)
npm run build      # tsc + vite build → dist/
npm run preview    # serve production build locally
npm run lint       # ESLint (max-warnings 0 — CI-blocking)
```

No test suite currently exists.

## Architecture

```
src/
  App.tsx                     # Root: loads/creates Garden record, renders canvas + sidebar
  db/
    database.ts               # Dexie schema + all TypeScript interfaces
    index.ts                  # Re-exports db singleton + initializePlants()
    plants.ts                 # Default plant catalog (custom pack)
    packs.ts                  # Additional plant packs (stardew_valley, kirov_oblast)
  components/
    GardenCanvas/             # Fabric.js canvas — primary editing surface
    Sidebar/                  # Tab panel: Beds list | Advisor | Sync | Plants | Settings
    BedEditor/                # Modal: assign plant, add care history, planting plan to a Bed
    BushEditor/               # Modal: same as BedEditor but for Bush objects
    Advisor/                  # Analyzes plant neighbors for incompatibilities / recommendations
    PlantManager/             # CRUD for custom plants, view all packs
    SyncManager/              # Export/import all DB tables via JSON file or QR code
  index.css / App.css         # Global styles
```

## Data model (`src/db/database.ts`)

| Table | Key | Purpose |
|---|---|---|
| `garden` | `++id` | Single record: plot width/height in metres |
| `objects` | `++id, type, createdAt` | Every placed shape on canvas (`bed`, `greenhouse`, `hotbed`, `barrel`, `well`, `path`, `bush`, `rest`) |
| `beds` | `++id, objectId, plantId` | Bed metadata linked to a `bed`-type object; holds current + planned plant |
| `bushes` | `++id, objectId, plantId` | Same but for `bush`-type objects |
| `plants` | `id, category, pack, growthType` | Plant catalog; `id` is a string slug |
| `careHistory` | `++id, bedId, date` | Per-bed events: `water`, `weed`, `fertilize`, `harvest`, `plant` |
| `plans` | `++id, bedId, plannedDate` | Future planting intentions linked to a bed |

`GardenObject.type` drives which editor modal opens (BedEditor for `bed`, BushEditor for `bush`).

## Canvas system (`GardenCanvas`)

- **Scale**: `SCALE = 10` px per metre. Garden coordinates → canvas pixels: `canvasPx = frameOffset + gardenMetres * SCALE`.
- Garden boundary is a non-interactive dashed `fabric.Rect` named `garden-frame`; objects can be placed outside it.
- Each placed object is a `fabric.Group` (rect + optional emoji text). The group carries `group.data = { id, type }` for DB lookups.
- A custom delete control (red ✕ button) is added to every group's `controls` map.
- Changes are saved debounced (500 ms) on `object:moving`/`object:scaling`, then immediately on `object:modified`.
- Zoom is handled via `canvas.viewportTransform` (mouse wheel + toolbar buttons); range 0.1–5×.

## Cross-component communication

Canvas and Sidebar are siblings and communicate exclusively through `window` custom events — there is no shared state or context:

| Event | Direction | Payload |
|---|---|---|
| `canvasObjectSelected` | canvas → sidebar | `{ objectId: number \| null }` |
| `selectObject` | sidebar → canvas | `{ objectId: number }` |
| `objectsUpdate` | any → all | _(none)_ — triggers DB reload |
| `gardenUpdate` | any → all | _(none)_ — triggers canvas reload |
| `openBedEditor` | sidebar → canvas | `{ bedId: number }` |
| `openBushEditor` | sidebar → canvas | `{ bushId: number }` |

## Plant packs

Plants have a `pack` field: `'custom'` (default), `'stardew_valley'`, `'kirov_oblast'`. The `kirov_oblast` pack is loaded from `KirObl.md` (reference data file). `initializePlants()` in `src/db/index.ts` seeds the DB with default plants on first run.

## Sync / data portability

`SyncManager` exports all DB tables as JSON. QR code generation is attempted only if the payload is under ~2 500 bytes; larger exports fall back to file download. Import reads the JSON and bulk-puts all records.

## PWA

Configured via `vite-plugin-pwa` (workbox `autoUpdate`, caches all JS/CSS/HTML/assets). Service worker is at `public/sw.js`. Theme colour `#4a7c59`.

## Key constraints

- No backend — all state is local IndexedDB. Sync is manual (file / QR).
- `fabric` v5 has incomplete TypeScript types; expect `// @ts-ignore` annotations in GardenCanvas.
- ESLint is zero-warnings; run `npm run lint` before committing.
- The `objectTypes` colour/emoji map is duplicated in both `GardenCanvas.tsx` and `Sidebar.tsx` — keep them in sync when adding new object types.
