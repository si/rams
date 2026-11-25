/**
 * SuperRams fan feed.
 *
 * Every 5 minutes (cron) we check whether a Derby fixture is "live" (from
 * WINDOW_BEFORE_MIN before kick-off to WINDOW_AFTER_MIN after). If so we poll
 * a public Bluesky list feed of Derby fans and store new posts in D1. Once the
 * window has closed plus REFRESH_AFTER_MIN, we refresh like/repost counts once
 * so the digest knows which posts landed.
 *
 * HTTP (all but /health need `Authorization: Bearer <READ_TOKEN>`):
 *   GET  /health
 *   GET  /fixtures
 *   POST /fixtures            JSON array of {id?, kickoff, opponent, home?, competition?}
 *   DELETE /fixtures/:id
 *   POST /poll?fixture=ID     poll now, ignoring the window (for testing)
 *   POST /refresh?fixture=ID  refresh engagement counts now
 *   GET  /match/:id?format=md|json
 */

export interface Env {
  DB: D1Database;
  BSKY_LIST: string; // at:// list URI or https://bsky.app/profile/<handle>/lists/<rkey>
  BSKY_API?: string;
  READ_TOKEN?: string;
  WINDOW_BEFORE_MIN?: string;
  WINDOW_AFTER_MIN?: string;
  REFRESH_AFTER_MIN?: string;
}

interface Fixture {
  id: string;
  kickoff_ms: number;
  kickoff_iso: string;
  opponent: string;
  home: number;
  competition: string | null;
  last_poll_ms: number | null;
  refreshed_ms: number | null;
}

interface PostRow {
  uri: string;
  cid: string | null;
  fixture_id: string | null;
  author_did: string;
  author_handle: string;
  author_name: string | null;
  text: string;
  created_ms: number;
  indexed_ms: number | null;
  reply_parent: string | null;
  reply_root: string | null;
  quote_uri: string | null;
  external_url: string | null;
  media: string | null;
  image_alts: string | null;
  like_count: number;
  repost_count: number;
  reply_count: number;
  quote_count: number;
}

const MIN = 60_000;
const MAX_PAGES = 10; // 100 posts a page, so up to 1,000 posts per poll
const UA = "superrams-fan-feed/0.1 (+Cloudflare Worker)";

// ---------- config helpers ----------

const api = (env: Env) => (env.BSKY_API || "https://public.api.bsky.app").replace(/\/$/, "");
const num = (v: string | undefined, d: number) => (v && !isNaN(Number(v)) ? Number(v) : d);
const windowFor = (env: Env, f: Fixture) => ({
  start: f.kickoff_ms - num(env.WINDOW_BEFORE_MIN, 120) * MIN,
  end: f.kickoff_ms + num(env.WINDOW_AFTER_MIN, 180) * MIN,
  refreshAt: f.kickoff_ms + (num(env.WINDOW_AFTER_MIN, 180) + num(env.REFRESH_AFTER_MIN, 60)) * MIN,
});

// ---------- Bluesky ----------

async function xrpc<T>(env: Env, method: string, params: Record<string, string | string[]>): Promise<T> {
  const url = new URL(`${api(env)}/xrpc/${method}`);
  for (const [k, v] of Object.entries(params)) {
    for (const item of Array.isArray(v) ? v : [v]) url.searchParams.append(k, item);
  }
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (!res.ok) throw new Error(`${method} ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json() as Promise<T>;
}

let listUriCache: string | null = null;

async function listUri(env: Env): Promise<string> {
  if (listUriCache) return listUriCache;
  const raw = (env.BSKY_LIST || "").trim();
  if (raw.startsWith("at://")) return (listUriCache = raw);
  const m = raw.match(/profile\/([^/]+)\/lists\/([^/?#]+)/);
  if (!m) throw new Error("BSKY_LIST must be an at:// list URI or a bsky.app list URL");
  let did = decodeURIComponent(m[1]);
  if (!did.startsWith("did:")) {
    did = (await xrpc<{ did: string }>(env, "com.atproto.identity.resolveHandle", { handle: did })).did;
  }
  return (listUriCache = `at://${did}/app.bsky.graph.list/${m[2]}`);
}

/** Bluesky post AT-URI to a clickable bsky.app link. */
export function postLink(uri: string, handle: string): string {
  const rkey = uri.split("/").pop();
  return `https://bsky.app/profile/${handle}/post/${rkey}`;
}

/** Flatten a FeedViewPost's post into a row. Returns null for things we skip. */
export function toRow(item: any, now: number): PostRow | null {
  if (item?.reason) return null; // reposts: not the member's own words
  const p = item?.post;
  const rec = p?.record;
  if (!p?.uri || !rec || rec.$type !== "app.bsky.feed.post") return null;

  const indexed = Date.parse(p.indexedAt) || now;
  let created = Date.parse(rec.createdAt);
  // createdAt is client-supplied; fall back to indexedAt if missing or in the future
  if (!created || created > indexed + 5 * MIN) created = indexed;

  const ev = p.embed ?? {};
  const t: string = ev.$type ?? "";
  const media = t.startsWith("app.bsky.embed.recordWithMedia") ? ev.media ?? {} : ev;
  const mt: string = media.$type ?? "";

  let quote: string | null = null;
  if (t.startsWith("app.bsky.embed.record#")) quote = ev.record?.uri ?? null;
  if (t.startsWith("app.bsky.embed.recordWithMedia")) quote = ev.record?.record?.uri ?? null;

  let mediaKind: string | null = null;
  let alts: string | null = null;
  if (mt.startsWith("app.bsky.embed.images")) {
    mediaKind = "images";
    alts = (media.images ?? []).map((i: any) => i.alt).filter(Boolean).join(" | ") || null;
  } else if (mt.startsWith("app.bsky.embed.video")) {
    mediaKind = "video";
    alts = media.alt || null;
  }

  return {
    uri: p.uri,
    cid: p.cid ?? null,
    fixture_id: null,
    author_did: p.author?.did ?? "",
    author_handle: p.author?.handle ?? "",
    author_name: p.author?.displayName || null,
    text: rec.text ?? "",
    created_ms: created,
    indexed_ms: indexed,
    reply_parent: rec.reply?.parent?.uri ?? null,
    reply_root: rec.reply?.root?.uri ?? null,
    quote_uri: quote,
    external_url: mt.startsWith("app.bsky.embed.external") ? media.external?.uri ?? null : null,
    media: mediaKind,
    image_alts: alts,
    like_count: p.likeCount ?? 0,
    repost_count: p.repostCount ?? 0,
    reply_count: p.replyCount ?? 0,
    quote_count: p.quoteCount ?? 0,
  };
}

// ---------- D1 ----------

const UPSERT = `INSERT INTO posts (uri, cid, fixture_id, author_did, author_handle, author_name, text,
  created_ms, indexed_ms, reply_parent, reply_root, quote_uri, external_url, media, image_alts,
  like_count, repost_count, reply_count, quote_count, fetched_ms, updated_ms)
VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?20)
ON CONFLICT(uri) DO UPDATE SET
  text = excluded.text, author_handle = excluded.author_handle, author_name = excluded.author_name,
  like_count = excluded.like_count, repost_count = excluded.repost_count,
  reply_count = excluded.reply_count, quote_count = excluded.quote_count,
  updated_ms = excluded.updated_ms`;

async function upsert(env: Env, rows: PostRow[], now: number) {
  if (!rows.length) return;
  const stmt = env.DB.prepare(UPSERT);
  await env.DB.batch(
    rows.map((r) =>
      stmt.bind(r.uri, r.cid, r.fixture_id, r.author_did, r.author_handle, r.author_name, r.text,
        r.created_ms, r.indexed_ms, r.reply_parent, r.reply_root, r.quote_uri, r.external_url,
        r.media, r.image_alts, r.like_count, r.repost_count, r.reply_count, r.quote_count, now),
    ),
  );
}

const getFixture = (env: Env, id: string) =>
  env.DB.prepare("SELECT * FROM fixtures WHERE id = ?").bind(id).first<Fixture>();

// ---------- polling ----------

async function pollFixture(env: Env, f: Fixture, now: number) {
  const w = windowFor(env, f);
  // Overlap the previous poll by 15 minutes; upserts make repeats harmless.
  const since = Math.max(w.start, (f.last_poll_ms ?? 0) - 15 * MIN);
  const list = await listUri(env);

  let cursor: string | undefined;
  let stored = 0;
  for (let page = 0; page < MAX_PAGES; page++) {
    const params: Record<string, string> = { list, limit: "100" };
    if (cursor) params.cursor = cursor;
    const res = await xrpc<{ feed: any[]; cursor?: string }>(env, "app.bsky.feed.getListFeed", params);

    const rows: PostRow[] = [];
    let oldest = Infinity;
    for (const item of res.feed ?? []) {
      const r = toRow(item, now);
      if (!r) continue;
      oldest = Math.min(oldest, r.indexed_ms ?? r.created_ms);
      if (r.created_ms >= w.start && r.created_ms <= w.end) rows.push({ ...r, fixture_id: f.id });
    }
    await upsert(env, rows, now);
    stored += rows.length;

    cursor = res.cursor;
    if (!cursor || !res.feed?.length || oldest < since) break;
  }

  await env.DB.prepare("UPDATE fixtures SET last_poll_ms = ? WHERE id = ?").bind(now, f.id).run();
  return { fixture: f.id, stored };
}

/** Re-fetch every stored post for a fixture to update engagement counts. */
async function refreshFixture(env: Env, f: Fixture, now: number) {
  const { results } = await env.DB.prepare("SELECT * FROM posts WHERE fixture_id = ?").bind(f.id).all<PostRow>();
  const byUri = new Map(results.map((r) => [r.uri, r]));
  const uris = [...byUri.keys()];
  let updated = 0;
  for (let i = 0; i < uris.length; i += 25) {
    const res = await xrpc<{ posts: any[] }>(env, "app.bsky.feed.getPosts", { uris: uris.slice(i, i + 25) });
    const rows: PostRow[] = [];
    for (const p of res.posts ?? []) {
      const r = toRow({ post: p }, now);
      const prev = byUri.get(p.uri);
      if (r && prev) rows.push({ ...r, fixture_id: f.id, created_ms: prev.created_ms });
    }
    await upsert(env, rows, now);
    updated += rows.length;
  }
  await env.DB.prepare("UPDATE fixtures SET refreshed_ms = ? WHERE id = ?").bind(now, f.id).run();
  return { fixture: f.id, updated, deleted_or_hidden: uris.length - updated };
}

async function tick(env: Env, now: number) {
  const before = num(env.WINDOW_BEFORE_MIN, 120) * MIN;
  const after = num(env.WINDOW_AFTER_MIN, 180) * MIN;
  const refresh = num(env.REFRESH_AFTER_MIN, 60) * MIN;

  const live = await env.DB.prepare("SELECT * FROM fixtures WHERE kickoff_ms - ? <= ? AND kickoff_ms + ? >= ?")
    .bind(before, now, after, now).all<Fixture>();
  const due = await env.DB.prepare(
    "SELECT * FROM fixtures WHERE refreshed_ms IS NULL AND kickoff_ms + ? <= ? AND kickoff_ms > ?",
  ).bind(after + refresh, now, now - 3 * 24 * 60 * MIN).all<Fixture>();

  const out: unknown[] = [];
  for (const f of live.results) out.push(await pollFixture(env, f, now));
  for (const f of due.results) out.push(await refreshFixture(env, f, now));
  return out;
}

// ---------- digest ----------

const ukTime = (ms: number) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit" }).format(ms);
const ukDateTime = (ms: number) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London", weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(ms);

/** Rough match phase from minutes since kick-off. Ignores stoppage time, so treat as a guide. */
export function phase(mins: number): string {
  if (mins < 0) return "Pre-match";
  if (mins < 50) return "First half (approx.)";
  if (mins < 65) return "Half-time (approx.)";
  if (mins < 115) return "Second half (approx.)";
  return "Full time and after";
}

const score = (p: PostRow) => p.like_count + 2 * p.repost_count + 2 * p.quote_count + p.reply_count;

function renderPost(p: PostRow, f: Fixture): string {
  const mins = Math.round((p.created_ms - f.kickoff_ms) / MIN);
  const rel = mins >= 0 ? `KO+${mins}` : `KO${mins}`;
  const who = p.author_name ? `${p.author_name} (@${p.author_handle})` : `@${p.author_handle}`;
  const flags = [
    p.reply_parent ? "reply" : null,
    p.quote_uri ? "quote" : null,
    p.media,
  ].filter(Boolean).join(", ");
  const stats = `${p.like_count} likes, ${p.repost_count} reposts, ${p.reply_count} replies`;
  const lines = [
    `- **${ukTime(p.created_ms)}** (${rel}) ${who}${flags ? ` [${flags}]` : ""}: ${stats}. [link](${postLink(p.uri, p.author_handle)})`,
    ...p.text.split("\n").map((l) => `  > ${l}`),
  ];
  if (p.image_alts) lines.push(`  > _alt: ${p.image_alts}_`);
  if (p.external_url) lines.push(`  > _link: ${p.external_url}_`);
  return lines.join("\n");
}

function renderMarkdown(f: Fixture, posts: PostRow[]): string {
  const title = f.home ? `Derby County vs ${f.opponent}` : `${f.opponent} vs Derby County`;
  const authors = new Set(posts.map((p) => p.author_did)).size;
  const out = [
    `# Fan feed: ${title}`,
    "",
    `${f.competition ? `${f.competition}, ` : ""}KO ${ukDateTime(f.kickoff_ms)} (UK)`,
    `${posts.length} posts from ${authors} accounts on the Bluesky list.`,
    f.refreshed_ms ? `Engagement counts refreshed ${ukDateTime(f.refreshed_ms)}.` : "Engagement counts not yet refreshed post-match.",
    "",
    "Quote with credit and a link. Phases are estimated from kick-off and ignore stoppage time.",
    "",
  ];

  const top = [...posts].filter((p) => score(p) > 0).sort((a, b) => score(b) - score(a)).slice(0, 10);
  if (top.length) {
    out.push("## Top posts", "", ...top.map((p) => renderPost(p, f)), "");
  }

  let current = "";
  for (const p of posts) {
    const ph = phase((p.created_ms - f.kickoff_ms) / MIN);
    if (ph !== current) {
      if (current) out.push("");
      out.push(`## ${ph}`, "");
      current = ph;
    }
    out.push(renderPost(p, f));
  }
  return out.join("\n") + "\n";
}

// ---------- HTTP ----------

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data, null, 2), { status, headers: { "Content-Type": "application/json" } });

function authorised(req: Request, env: Env): boolean {
  if (!env.READ_TOKEN) return false;
  const got = req.headers.get("Authorization") ?? "";
  const want = `Bearer ${env.READ_TOKEN}`;
  if (got.length !== want.length) return false;
  let diff = 0;
  for (let i = 0; i < got.length; i++) diff |= got.charCodeAt(i) ^ want.charCodeAt(i);
  return diff === 0;
}

/** Fixture id = match date in UK time, e.g. 2026-11-28. */
export function ukDateId(ms: number): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(ms);
}

async function addFixtures(env: Env, body: unknown) {
  const items = Array.isArray(body) ? body : [body];
  const stmts = [];
  const added = [];
  for (const it of items as any[]) {
    const ko = Date.parse(it?.kickoff);
    if (!ko || !/[+-]\d\d:\d\d$|Z$/.test(String(it.kickoff))) {
      throw new Error(`kickoff needs an ISO time with offset, got ${JSON.stringify(it?.kickoff)}`);
    }
    if (!it.opponent) throw new Error("opponent is required");
    const id = it.id || ukDateId(ko);
    stmts.push(
      env.DB.prepare(
        `INSERT INTO fixtures (id, kickoff_ms, kickoff_iso, opponent, home, competition) VALUES (?,?,?,?,?,?)
         ON CONFLICT(id) DO UPDATE SET kickoff_ms = excluded.kickoff_ms, kickoff_iso = excluded.kickoff_iso,
           opponent = excluded.opponent, home = excluded.home, competition = excluded.competition`,
      ).bind(id, ko, it.kickoff, it.opponent, it.home === false ? 0 : 1, it.competition ?? null),
    );
    added.push(id);
  }
  if (stmts.length) await env.DB.batch(stmts);
  return added;
}

async function handle(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/$/, "") || "/";

  if (path === "/health") return json({ ok: true });
  if (!authorised(req, env)) return json({ error: "unauthorised" }, 401);

  const now = Date.now();

  if (path === "/fixtures" && req.method === "GET") {
    const { results } = await env.DB.prepare(
      "SELECT f.*, (SELECT COUNT(*) FROM posts p WHERE p.fixture_id = f.id) AS post_count FROM fixtures f ORDER BY kickoff_ms",
    ).all();
    return json(results);
  }
  if (path === "/fixtures" && req.method === "POST") {
    try {
      return json({ added: await addFixtures(env, await req.json()) });
    } catch (e) {
      return json({ error: String((e as Error).message ?? e) }, 400);
    }
  }
  const del = path.match(/^\/fixtures\/([\w-]+)$/);
  if (del && req.method === "DELETE") {
    await env.DB.batch([
      env.DB.prepare("DELETE FROM posts WHERE fixture_id = ?").bind(del[1]),
      env.DB.prepare("DELETE FROM fixtures WHERE id = ?").bind(del[1]),
    ]);
    return json({ deleted: del[1] });
  }

  if ((path === "/poll" || path === "/refresh") && req.method === "POST") {
    const id = url.searchParams.get("fixture");
    if (!id) return json(await tick(env, now));
    const f = await getFixture(env, id);
    if (!f) return json({ error: `no fixture ${id}` }, 404);
    return json(path === "/poll" ? await pollFixture(env, f, now) : await refreshFixture(env, f, now));
  }

  const m = path.match(/^\/match\/([\w-]+)$/);
  if (m && req.method === "GET") {
    const f = await getFixture(env, m[1]);
    if (!f) return json({ error: `no fixture ${m[1]}` }, 404);
    const { results } = await env.DB.prepare("SELECT * FROM posts WHERE fixture_id = ? ORDER BY created_ms")
      .bind(f.id).all<PostRow>();
    if (url.searchParams.get("format") === "json") {
      return json({ fixture: f, posts: results.map((p) => ({ ...p, link: postLink(p.uri, p.author_handle) })) });
    }
    return new Response(renderMarkdown(f, results), { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
  }

  return json({ error: "not found" }, 404);
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    try {
      return await handle(req, env);
    } catch (e) {
      console.error(e);
      return json({ error: String((e as Error).message ?? e) }, 500);
    }
  },
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(tick(env, Date.now()).then((r) => console.log(JSON.stringify(r))));
  },
} satisfies ExportedHandler<Env>;
