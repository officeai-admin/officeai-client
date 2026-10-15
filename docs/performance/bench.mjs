// Benchmark for the Office AI client, run against `vite preview` of a production build.
// Supabase and the RAG API are mocked with Playwright routes so every run gets identical data
// and latency. See report.md for what each metric means.
//
//   VITE_SUPABASE_URL=https://mockref.supabase.co VITE_SUPABASE_PUBLISHABLE_KEY=mock-key \
//     VITE_RAG_API_URL=https://api.mock.test npx vite build && npx vite preview --port 4173
//   npm i --no-save playwright-core   # in any scratch directory holding this file
//   CHROME=/path/to/chromium node bench.mjs <label> [runs]
//
// Env: BASE (default http://localhost:4173), ONLY=landing|app, NET=slow4g,
//      CHECK=1 (is the newest message in view after opening chats?), TYPING=1|empty (keystroke probe).
import { chromium } from "playwright-core";
import { writeFileSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:4173";
const SUPA = "https://mockref.supabase.co";
const API = "https://api.mock.test";
const LABEL = process.argv[2] ?? "run";
const RUNS = Number(process.argv[3] ?? 5);
// Throttled timings vary a few percent run to run; alternate runs between builds when comparing.
const ONLY = process.env.ONLY?.split(",");

const CONVS = 30;
const LONG = 400; // messages in a long history
const CACHED = 5; // conversations whose messages are already in localStorage
const API_LATENCY = 120;
const CPU = 4;

// ---------- synthetic data ----------
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const words = "the quick report table budget query invoice draft summary review chart policy client meeting deadline result value column formula total revenue cost".split(" ");
const sentence = (n) => Array.from({ length: n }, () => words[Math.floor(rand() * words.length)]).join(" ");
function assistantContent(tag) {
  return [
    `## Answer ${tag}`,
    `${sentence(30)} **${sentence(3)}** and \`inline_code()\` ${sentence(20)}.`,
    `- ${sentence(8)}`,
    `- ${sentence(10)}`,
    `- ${sentence(6)}`,
    "```python",
    ...Array.from({ length: 12 }, (_, i) => `def step_${i}(df):\n    return df.groupby("${words[i % words.length]}").sum()  # ${sentence(4)}`),
    "```",
    `${sentence(25)} [${tag}]`,
  ].join("\n");
}
const userContent = (tag) => `${sentence(18)}? [${tag}]`;
const DAY = 86400000;
const NOW = Date.UTC(2026, 9, 15, 12);
const convs = Array.from({ length: CONVS }, (_, c) => ({
  conversation_id: `conv-${c}`,
  user_id: "u1",
  title: `Thread ${c} ${sentence(3)}`,
  title_source: "user",
  status: "active",
  created_at: new Date(NOW - c * DAY * 1.5).toISOString(),
  updated_at: new Date(NOW - c * DAY * 1.5).toISOString(),
}));
function serverMessages(c) {
  return Array.from({ length: LONG }, (_, i) => {
    const tag = `m-${c}-${i}`;
    return {
      message_id: `msg-${c}-${i}`,
      conversation_id: `conv-${c}`,
      user_id: "u1",
      role: i % 2 ? "assistant" : "user",
      content: i % 2 ? assistantContent(tag) : userContent(tag),
      created_at: new Date(NOW - c * DAY * 1.5 + i * 60000).toISOString(),
    };
  });
}
const SERVER = convs.map((_, c) => serverMessages(c));
const cache = convs.map((cv, c) => ({
  id: cv.conversation_id,
  title: cv.title,
  createdAt: Date.parse(cv.created_at),
  updatedAt: Date.parse(cv.updated_at),
  model: "GPT-Style Assistant",
  messages:
    c < CACHED
      ? SERVER[c].map((m) => ({ id: m.message_id, role: m.role, content: m.content, createdAt: Date.parse(m.created_at), status: "complete" }))
      : [],
  conversationId: cv.conversation_id,
}));
const CACHE_JSON = JSON.stringify(cache);
const exp = Math.floor(Date.now() / 1000) + 3600 * 24;
const USER = { id: "u1", aud: "authenticated", role: "authenticated", email: "bench@example.com", app_metadata: {}, user_metadata: {}, created_at: "2026-01-01T00:00:00Z" };
const SESSION = { access_token: "header.payload.sig", refresh_token: "r", token_type: "bearer", expires_in: 86400, expires_at: exp, user: USER };

// ---------- harness ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const median = (xs) => {
  const s = xs.filter((x) => x != null && !Number.isNaN(x)).sort((a, b) => a - b);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

async function newPage(browser, { signedIn }) {
  const context = await browser.newContext({ viewport: { width: 1366, height: 860 } });
  await context.route(`${SUPA}/**`, async (route) => {
    const url = route.request().url();
    const body = url.includes("/user") ? USER : url.includes("/token") ? SESSION : {};
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body), headers: { "access-control-allow-origin": "*" } });
  });
  await context.route(`${API}/**`, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const headers = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" };
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers });
    await sleep(url.pathname === "/chat" ? 300 : API_LATENCY);
    let body = {};
    const m = url.pathname.match(/^\/conversations\/conv-(\d+)\/messages$/);
    if (m) body = { status: "ok", conversation_id: `conv-${m[1]}`, messages: SERVER[Number(m[1])] };
    else if (url.pathname === "/conversations" && req.method() === "GET") body = { status: "ok", conversations: convs };
    else if (url.pathname === "/conversations" && req.method() === "POST")
      body = { status: "ok", conversation: { ...convs[0], conversation_id: `new-${Date.now()}` } };
    else if (url.pathname === "/chat") body = { answer: assistantContent("reply"), session_id: "s", used_context_count: 0, route: "x" };
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body), headers });
  });
  if (signedIn) {
    await context.addInitScript(
      ([session, cacheJson]) => {
        if (localStorage.getItem("bench:seeded")) return;
        localStorage.setItem("bench:seeded", "1");
        localStorage.setItem("sb-mockref-auth-token", session);
        localStorage.setItem("ai-assistant:conversations", cacheJson);
        localStorage.setItem("ai-assistant:active-id", "conv-0");
      },
      [JSON.stringify(SESSION), CACHE_JSON]
    );
  }
  // Observers installed before any app code runs.
  await context.addInitScript(() => {
    const w = window;
    w.__lt = [];
    w.__ev = [];
    w.__marks = {};
    w.__lcp = 0;
    try {
      new PerformanceObserver((l) => l.getEntries().forEach((e) => w.__lt.push({ start: e.startTime, dur: e.duration }))).observe({ type: "longtask", buffered: true });
      new PerformanceObserver((l) => l.getEntries().forEach((e) => { w.__lcp = e.startTime; w.__lcpEl = (e.element?.tagName ?? "") + "." + (e.element?.className ?? "") + " " + (e.url ?? ""); })).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((l) => l.getEntries().forEach((e) => e.interactionId && w.__ev.push({ id: e.interactionId, name: e.name, dur: e.duration }))).observe({ type: "event", durationThreshold: 16, buffered: true });
    } catch {}
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU });
  await cdp.send("Network.enable");
  const slow = process.env.NET === "slow4g"; // Lighthouse mobile: 150 ms RTT, 1.6 Mbps
  await cdp.send("Network.emulateNetworkConditions", slow
    ? { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 }
    : { offline: false, latency: 40, downloadThroughput: (10 * 1024 * 1024) / 8, uploadThroughput: (5 * 1024 * 1024) / 8 });
  return { context, page };
}

// Poll every frame for a condition; resolves with performance.now() after the frame that shows it is painted.
const WAIT_FN = `async (expr, timeout = 15000) => {
  const t0 = performance.now();
  const check = new Function("return (" + expr + ")");
  while (!check()) {
    if (performance.now() - t0 > timeout) return null;
    await new Promise((r) => requestAnimationFrame(r));
  }
  await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
  return performance.now();
}`;

const hasText = (t) => `document.body && document.body.innerText.includes(${JSON.stringify(t)})`;
const hasTag = (t) => `!!document.evaluate("//*[contains(text(), '${t}')]", document.body, null, 9, null).singleNodeValue`;

async function landing(browser) {
  const { context, page } = await newPage(browser, { signedIn: false });
  page.on("console", (m) => m.text().startsWith("LCP") && process.stderr.write(m.text() + "\n"));
  await page.goto(BASE + "/", { waitUntil: "load" });
  await sleep(2500);
  const r = await page.evaluate(() => {
    const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime;
    const res = performance.getEntriesByType("resource");
    const js = res.filter((e) => e.name.endsWith(".js")).reduce((a, e) => a + e.decodedBodySize, 0);
    const lt = window.__lt.reduce((a, e) => a + Math.max(0, e.dur - 50), 0);
    const fonts = res.filter((e) => e.name.includes("fonts.g")).map((e) => Math.round(e.responseEnd));
    console.log("LCP", window.__lcpEl, "fonts", fonts.join(","));
    return { fcp, lcp: window.__lcp, jsKB: js / 1024, tbt: lt, fontsDone: Math.max(0, ...fonts) };
  });
  // route transitions inside the SPA
  const toPricing = await page.evaluate(async ([wait]) => {
    const w = eval(wait);
    const t0 = performance.now();
    document.querySelector('a[href="/pricing"]').click();
    const t1 = await w(`location.pathname === "/pricing" && document.querySelector(".pricing, [class*=pricing], h1") && !document.body.innerText.includes("${document.querySelector("h1").innerText.slice(0, 20)}")`);
    return t1 - t0;
  }, [WAIT_FN]);
  const toSignIn = await page.evaluate(async ([wait]) => {
    const w = eval(wait);
    const a = document.querySelector('a[href="/signin"], a[href="/signup"]');
    if (!a) return null;
    const t0 = performance.now();
    a.click();
    const t1 = await w(`/^\\/sign(in|up)$/.test(location.pathname) && document.querySelector("form")`);
    return t1 - t0;
  }, [WAIT_FN]);
  await context.close();
  return { ...r, toPricing, toSignIn };
}

async function app(browser) {
  const { context, page } = await newPage(browser, { signedIn: true });
  const out = {};
  // Track when the active conversation's history is shown, and whether it ever disappears again.
  await context.addInitScript(() => {
    const w = window;
    let shown = false;
    w.__flash = 0;
    const tick = () => {
      if (!document.body) return requestAnimationFrame(tick);
      const has = !!document.evaluate("//*[contains(text(), '[m-0-399]')]", document.body, null, 9, null).singleNodeValue;
      if (has && !shown) { shown = true; w.__marks.history ??= performance.now(); }
      if (!has && shown) { shown = false; w.__flash++; }
      if (!w.__marks.shell && document.body.innerText.includes("New chat")) w.__marks.shell = performance.now();
      if (performance.now() < 8000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.goto(BASE + "/app", { waitUntil: "load" });
  await page.evaluate(`(${WAIT_FN})(${JSON.stringify(hasTag("[m-0-399]"))})`);
  await sleep(2500); // let the server sync and any re-render settle
  Object.assign(
    out,
    await page.evaluate(() => {
      const lt = window.__lt;
      return {
        appShell: window.__marks.shell,
        appHistory: window.__marks.history,
        appFlash: window.__flash,
        appLongTasks: lt.length,
        appTBT: lt.reduce((a, e) => a + Math.max(0, e.dur - 50), 0),
        appMaxTask: lt.reduce((a, e) => Math.max(a, e.dur), 0),
      };
    })
  );

  // Open older conversations from the sidebar: 1-2 have cached messages, 10 and 20 do not.
  const open = async (c) =>
    page.evaluate(
      async ([wait, title, tag]) => {
        const w = eval(wait);
        const el = [...document.querySelectorAll("span.truncate")].find((s) => s.textContent === title);
        el.scrollIntoView();
        const t0 = performance.now();
        el.click();
        const t1 = await w(`!!document.evaluate("//*[contains(text(), '${tag}')]", document.body, null, 9, null).singleNodeValue`);
        return t1 - t0;
      },
      [WAIT_FN, convs[c].title, `[m-${c}-399]`]
    );
  await sleep(300);
  const ltBefore = await page.evaluate(() => window.__lt.length);
  out.openCached = await open(2);
  await sleep(500);
  out.openUncached = await open(10);
  await sleep(500);
  out.openUncached2 = await open(20);
  await sleep(500);
  out.reopen = await open(10);
  await sleep(500);
  out.backToFirst = await open(0);
  await sleep(800);
  Object.assign(out, await page.evaluate((n) => {
    const lt = window.__lt.slice(n);
    return { openLongTasks: lt.length, openMaxTask: lt.reduce((a, e) => Math.max(a, e.dur), 0) };
  }, ltBefore));

  // Scroll a 400-message history from bottom to top, 600px per frame.
  Object.assign(
    out,
    await page.evaluate(async () => {
      const box = [...document.querySelectorAll(".overflow-y-auto")].find((e) => e.scrollHeight > 5000);
      box.scrollTop = box.scrollHeight;
      await new Promise((r) => setTimeout(r, 500));
      const frames = [];
      let last = performance.now();
      const t0 = last;
      while (box.scrollTop > 0) {
        box.scrollTop -= 600;
        await new Promise((r) => requestAnimationFrame(r));
        const now = performance.now();
        frames.push(now - last);
        last = now;
      }
      frames.sort((a, b) => a - b);
      return {
        scrollTotal: performance.now() - t0,
        scrollFrames: frames.length,
        scrollP95: frames[Math.floor(frames.length * 0.95)],
        scrollJank: frames.filter((f) => f > 50).length,
        domNodes: document.getElementsByTagName("*").length,
      };
    })
  );

  // Interactions: typing in the input, liking a message, sending a message.
  await page.evaluate(() => (window.__ev = []));
  await page.click("textarea");
  await page.keyboard.type("how do i total a column", { delay: 30 });
  await sleep(300);
  out.typeINP = await page.evaluate(() => Math.max(0, ...window.__ev.filter((e) => e.name.startsWith("key")).map((e) => e.dur)));
  await page.evaluate(() => (window.__ev = []));
  await page.locator('button[aria-label="Like"]').last().click({ force: true });
  await sleep(300);
  out.likeINP = await page.evaluate(() => Math.max(0, ...window.__ev.map((e) => e.dur)));
  await sleep(2000); // toast clears
  out.sendToVisible = await page.evaluate(
    async ([wait]) => {
      const w = eval(wait);
      const ta = document.querySelector("textarea");
      const t0 = performance.now();
      ta.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      const t1 = await w(`[...document.querySelectorAll(".whitespace-pre-wrap")].some((e) => e.textContent === "how do i total a column")`);
      return t1 - t0;
    },
    [WAIT_FN]
  );
  await sleep(1500);
  out.storageKB = await page.evaluate(() => (localStorage.getItem("ai-assistant:conversations")?.length ?? 0) / 1024);
  await context.close();
  return out;
}

async function checkBottom(browser) {
  const { context, page } = await newPage(browser, { signedIn: true });
  await page.goto(BASE + "/app", { waitUntil: "load" });
  await sleep(3000);
  const out = [];
  for (const c of [0, 2, 10, 20, 2]) {
    await page.evaluate((title) => [...document.querySelectorAll("span.truncate")].find((s) => s.textContent === title).click(), convs[c].title);
    await sleep(2500);
    out.push(await page.evaluate((tag) => {
      const box = [...document.querySelectorAll(".overflow-y-auto")].find((e) => e.scrollHeight > 5000);
      const el = document.evaluate(`//*[contains(text(), '${tag}')]`, document.body, null, 9, null).singleNodeValue;
      const r = el.getBoundingClientRect(), b = box.getBoundingClientRect();
      return { tag, gap: Math.round(box.scrollHeight - box.scrollTop - box.clientHeight), lastVisible: r.bottom <= b.bottom + 1 && r.top >= b.top };
    }, `[m-${c}-399]`));
  }
  await page.screenshot({ path: new URL("./bottom.png", import.meta.url).pathname });
  await context.close();
  console.log(JSON.stringify(out));
}

const browser = await chromium.launch({ executablePath: process.env.CHROME ?? undefined, headless: true });
async function typingProbe(browser) {
  const { context, page } = await newPage(browser, { signedIn: true });
  await page.goto(BASE + "/app", { waitUntil: "load" });
  await sleep(3500);
  const r = await page.evaluate(async () => {
    const ta = document.querySelector("textarea");
    const t = [];
    for (let i = 0; i < 20; i++) {
      const t0 = performance.now();
      ta.style.height = "auto";
      void ta.scrollHeight;
      ta.style.height = (40 + (i % 2)) + "px";
      void document.body.offsetHeight;
      t.push(performance.now() - t0);
    }
    t.sort((a, b) => a - b);
    return { forcedLayoutMedian: t[10] };
  });
  if (process.env.TYPING === "empty") { await page.click("text=New chat"); await sleep(1000); }
  await page.click("textarea");
  await page.evaluate(() => (window.__ev = []));
  if (process.env.TRACE) await browser.startTracing(page, { path: new URL("./typing-trace.json", import.meta.url).pathname, categories: ["devtools.timeline", "blink", "v8.execute"] });
  await page.keyboard.type("how do i total a column", { delay: 40 });
  await sleep(300);
  if (process.env.TRACE) await browser.stopTracing();
  const ev = await page.evaluate(() => window.__ev.filter((e) => e.name.startsWith("key")).map((e) => e.dur));
  console.log(JSON.stringify({ ...r, keyEvents: ev.length, keyMax: Math.max(0, ...ev) }));
  await context.close();
}

if (process.env.TYPING) { await typingProbe(browser); await browser.close(); process.exit(0); }
if (process.env.CHECK) { await checkBottom(browser); await browser.close(); process.exit(0); }
const results = [];
for (let i = 0; i < RUNS; i++) {
  const r = {};
  if (!ONLY || ONLY.includes("landing")) Object.assign(r, await landing(browser));
  if (!ONLY || ONLY.includes("app")) Object.assign(r, await app(browser));
  results.push(r);
  process.stderr.write(`run ${i + 1}/${RUNS} done\n`);
}
await browser.close();
const keys = Object.keys(results[0]);
const summary = Object.fromEntries(keys.map((k) => [k, median(results.map((r) => r[k]))]));
for (const [k, v] of Object.entries(summary)) console.log(`${k.padEnd(16)} ${v == null ? "n/a" : Number(v).toFixed(1)}`);
writeFileSync(new URL(`./results-${LABEL}.json`, import.meta.url), JSON.stringify({ summary, results }, null, 2));
