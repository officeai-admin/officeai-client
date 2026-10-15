# Performance report

What was slow in the client, what changed, and the measured effect of each change.

## Method

- **Build:** production (`vite build` + `vite preview`), never the dev server.
- **Backend:** Supabase and the RAG API are mocked with Playwright request routes, so every run gets identical data and latency. Each API call takes 120 ms; `/chat` takes 300 ms. The real backend wasn't used: it only accepts the `localhost:5173` origin and the `.env` keys weren't available to this session.
- **Data:** synthetic.
  - 30 conversations, each with 400 messages. Every other message is an assistant answer with a heading, a list, inline code and a 12-line code block.
  - 5 conversations are already cached in localStorage (about 1.7 MB).
  - The mocked messages endpoint returns all 400 messages. The real one is called with `limit=100`, so this is a stress case for long histories.
- **Browser:** headless Chromium, 1366×860, CPU throttled 4×.
  - Network for chat app runs: 40 ms RTT / 10 Mbps.
  - Landing page: also measured at Slow 4G (150 ms RTT / 1.6 Mbps, the Lighthouse mobile profile).
- **Script:** [`bench.mjs`](./bench.mjs). Each value is the median of 5–6 runs. Final comparisons alternate between builds (A/B/A/B) so machine noise affects both equally.

### Metrics

| Metric | What it measures |
| --- | --- |
| Landing FCP / LCP | First and largest contentful paint of a cold load of `/` |
| Route change | Click on a link until the new page is painted (`/pricing`, `/signup`) |
| `/app` shell + history | Cold load of `/app` with a saved session until the sidebar and the open conversation's newest message are painted |
| History flash | How many times the open conversation's history disappears after it was first shown |
| `/app` TBT, longest task | Long tasks during `/app` startup |
| Open conversation | Click in the sidebar until that conversation's newest message is painted: cached / uncached (one API call) / reopen (already loaded) |
| Long tasks while opening | Across 5 conversation opens, including any background work they trigger |
| Scroll | Scrolling a 400-message history from bottom to top, 600 px per frame: p95 frame time and frames over 50 ms |
| Like / send / type | Event Timing duration (INP) for liking a message and typing; time from Enter until the sent message is painted |

## Results: origin/main vs this branch

Medians of 6 runs per build, alternating builds.

| Metric | main | this branch | Change |
| --- | ---: | ---: | ---: |
| Landing LCP (10 Mbps) | 736 ms | 522 ms | −29% |
| Landing LCP (Slow 4G) | 2436 ms | 1504 ms | −38% |
| Landing FCP (Slow 4G) | 1232 ms | 1276 ms | +4% (the hero image now downloads earlier and shares bandwidth) |
| `/app` shell + history painted | 591 ms | 404 ms | −32% |
| History flash on `/app` startup | 1 | 0 | gone |
| `/app` startup TBT | 407 ms | 39 ms | −90% |
| `/app` startup longest task | 285 ms | 89 ms | −69% |
| Open cached older conversation | 425 ms | 54 ms | −87% |
| Open uncached older conversation | 409 ms | 184 ms | −55% (120 ms of this is the mocked API) |
| Reopen a loaded conversation | 279 ms | 45 ms | −84% |
| Long tasks while opening 5 conversations | 10 (max 188 ms) | 0–1 (max 26 ms) | |
| Like a message (INP) | 92 ms | 24 ms | −74% |
| Send until message shows | 76 ms | 25 ms | −67% |
| Typing (INP) | 40 ms | 32 ms | about the same; see remaining gaps |
| Scroll 400 messages: p95 frame / frames over 50 ms | 17.4 ms / 0 | 17.7 ms / 0 | unchanged (scrolling was already smooth) |
| Route change to `/pricing` | 26 ms | 27 ms | unchanged |
| Route change to `/signup` (10 Mbps / Slow 4G) | 133 / 499 ms | 132 / 499 ms | unchanged; see remaining gaps |
| JS on the landing page | 175.7 KB | 176.4 KB | +0.7 KB |

## Bottlenecks found (baseline, ranked by measured impact)

1. **Opening a conversation took about 400 ms.** Two separate causes:
   - The conversation-list sync replaced every conversation's messages with `[]`, so even cached history had to be fetched again before it could be shown.
   - Rendering and laying out all 400 messages at once took about 270 ms, in one long task.
2. **`/app` startup: TBT 393 ms.** The cached history rendered in full, then was wiped by the list sync (the welcome screen flashed), then rendered again after the fetch.
3. **Interactions re-rendered every message.**
   - `ChatMessage` wasn't memoised, and the pane passed it new callbacks on every render.
   - Every store change also ran a synchronous `JSON.stringify` and `localStorage.setItem` over the entire cache.
4. **Landing LCP waited on the hero image.** The image (a 150 KB PNG used as a CSS background) was only discovered after the entry chunk, the page chunk and the page CSS had all loaded.

## Fixes, in order, each measured against the previous commit

### 1. Keep cached history on screen while the server copy loads (`chatStore.ts`)

- After the list sync, cached messages stay visible and are refreshed from the server in the background.
- Messages the server didn't change keep their object identity, so they don't re-render.
- If a message is added locally while a refresh is in flight, the refresh doesn't overwrite it.
- The final state is still whatever the server returns.

| Metric | Before | After |
| --- | ---: | ---: |
| History flash | 1 | 0 |
| `/app` TBT | 393 ms | 243 ms |
| `/app` long tasks | 3 | 1 |
| Open cached conversation | 400 ms | 262 ms |

Side effect: more history now stays in the localStorage cache (1.7 → 2.9 MB in this scenario), which made each save more expensive (send 80 → 113 ms). Fix 4 removes that cost.

### 2. Render long histories newest-first; backfill older messages when idle (`ChatMessages.tsx`)

- The list renders the newest 30 messages first.
- Older messages are added above in chunks of 30, during idle time or immediately when the reader scrolls up to them. The reader's scroll position is restored manually (`overflow-anchor: none`), so this works the same in Safari.
- The list remounts for each conversation.
- Opening a conversation now jumps straight to its newest message. Before, it smooth-scrolled from the top through the whole history, and switching between two equally long chats didn't scroll at all. New messages still glide in.

| Metric | Before | After |
| --- | ---: | ---: |
| Reopen | 256 ms | 46 ms |
| Open cached | 262 ms | 57 ms |
| Open uncached | 404 ms | 204 ms |
| `/app` shell + history | 632 ms | 426 ms |
| `/app` TBT | 243 ms | 42 ms |
| Scroll | unchanged | unchanged |

### 3. Memoise messages (`ChatMessage.tsx`, `ChatLayout.tsx`)

- `ChatMessage` is wrapped in `memo()`.
- The edit, regenerate and feedback callbacks are now stable. Regenerate reads the conversation from the store.

| Metric | Before | After |
| --- | ---: | ---: |
| Like (INP) | 104 ms | 48 ms |
| Send until message shows | 107 ms | 81 ms |
| Long tasks during opens + backfill | 1 (50 ms) | 0 |

### 4. Coalesce conversation cache writes (`storage.ts`)

- Saves are batched into one write per idle period.
- Pending writes are flushed on `pagehide` and when the tab becomes hidden, so closing or reloading the tab still saves.
- The same data is persisted; it is written a moment later.

| Metric | Before | After |
| --- | ---: | ---: |
| Send until message shows | 81 ms | 29 ms |
| Like (INP) | 48 ms | 24 ms |
| Open uncached | 205 ms | 187 ms |

### 5. Hero image as lossless WebP (`landing/assets`, `landing.css`)

The image is pixel-identical and 19% smaller (150 → 122 KB).

| Metric | Before | After |
| --- | ---: | ---: |
| Landing LCP, Slow 4G (two alternating rounds) | 2430 / 2424 ms | 2342 / 2298 ms |
| Landing LCP, 10 Mbps | 736 ms | 724 ms (within noise) |

### 6. Preload the hero image from the entry chunk (`App.tsx`)

- The entry chunk adds `<link rel="preload" as="image">` on `/`, `/pricing`, `/signin` and `/signup`.
- Signed-in visitors to `/` and the chat app don't fetch the image.

| Metric | Before | After |
| --- | ---: | ---: |
| Landing LCP, Slow 4G | 2310 / 2300 ms | 1740 / 1780 ms |
| Landing LCP, 10 Mbps | 708 ms | 496 ms (LCP now equals FCP) |
| Landing FCP, Slow 4G | 1233 ms | 1255 ms |

`fetchpriority="high"` made no measurable difference, so it isn't set.

## Attempts that were reverted or not applied

- **`content-visibility: auto` on message rows.** It was fast: reopen 256 → 108 ms, like INP 96 → 16 ms. It was reverted because:
  - After opening a chat, the smooth scroll stopped at the estimated height, leaving the view about 51,000 px short of the newest message.
  - It would make the page jump while scrolling up in Safari, which has no scroll anchoring.

  Fix 2 is faster and doesn't have either problem.
- **`contain: strict` on the message scroller (aimed at typing).** Typing INP stayed at 40 ms vs 40–48 ms, so it was reverted.
- **Lossy WebP for the halftone.** At q75–85 the file was 1.0–1.3 MB, larger than the PNG. Not used.
- **Building the auth client directly from `@supabase/auth-js` (not applied, needs a decision).**
  - The app only uses `supabase.auth`. `createClient()` also bundles the PostgREST, Storage, Realtime and Functions clients.
  - Building `AuthClient` directly, with the same options `createClient()` passes (URL, apikey headers, storage key, implicit flow, auto-refresh, session detection), cut the chunk loaded by `/app` and the sign-in pages from 231.7 KB to 111.4 KB (gzip 60.6 → 27.0 KB).
  - It wasn't shipped because it swaps the client the auth code runs on, and it couldn't be checked against the real Supabase project here.
  - It is the largest remaining load-time win for `/app` and `/signin`.

## Remaining gaps

- **Supabase chunk (231.7 KB).** Loaded by `/app` and on the way to `/signin` and `/signup`. On Slow 4G the change from the landing page to `/signup` takes about 500 ms, almost all of it this chunk. Options:
  - The auth-js change above.
  - Prefetching the chunk on link hover. Today that would start the Supabase client before the visitor clicks, which the router's design avoids.
- **Typing INP of 32–40 ms with a long chat open.** Each keystroke costs only about 5 ms on the main thread (traced). The rest is frame presentation in headless software rendering, so it should be re-checked in a real browser before acting on it.
- **Landing fonts.** Google Fonts are loaded through `@import` inside the landing CSS. That chains HTML → JS → CSS → fonts CSS → font files. It doesn't affect LCP (the image is the LCP element), but it delays the swap to the web fonts.
- **Not measured against the real backend.** Real API latency, the real `limit=100` message pages, and Supabase token refresh weren't measured. All timings here come from the mocked setup above.
- **localStorage cache size.** The cache now holds every conversation the user has opened, about 0.3 MB for a 400-message chat. Above the browser's roughly 5 MB quota, saving fails silently (as it did before) and the cache stops updating. Capping how many conversations the cache keeps would be a small follow-up.

## Validation

- `npm run build` passes.
- `npx tsc -b`: only the existing error in `src/components/ui/prompt-input.tsx`.
- `npm run lint`: the same 145 problems as origin/main, all in files this branch doesn't touch.
- Smoke test against the production build with the mocked backend, all passing:
  - `/`, `/pricing`, `/signin` and `/signup` render with the WebP plate.
  - Password sign-in lands in `/app`.
  - An older conversation opens on its newest message, backfills to its first message, and stays at the bottom.
  - Sending a message shows the question and the reply.
  - Uploading a PDF attaches it without an error.
  - Liking a message toggles it.
  - After a reload, the cached conversation is shown, including the new message.
  - No page errors.
