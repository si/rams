# SuperRams fan feed

A Cloudflare Worker that captures matchday posts from a Bluesky list of Derby
fans, so the Patreon match report has the fans' reaction ready to quote.

- A **Cron Trigger** runs every 5 minutes. It does nothing unless a fixture's
  window is open (2 hours before kick-off to 3 hours after, by default).
- While a window is open it polls `app.bsky.feed.getListFeed` on the public
  Bluesky API (no login needed) and upserts the posts into **D1**. Reposts are
  skipped; replies, quotes, images and link cards are kept.
- An hour after the window closes it re-fetches every stored post once to
  update likes and reposts.
- `GET /match/<date>` returns a Markdown digest: top posts, then everything in
  time order grouped by rough match phase.

Everything fits in the Workers free plan.

## One-off setup

1. **Make the list.** On Bluesky: Lists → New list → a "curation" list (not a
   moderation list), e.g. "Rams fans". Add the accounts. Copy the list's URL,
   something like `https://bsky.app/profile/<you>.bsky.social/lists/3l...`.
   The list is public, which is how the Worker reads it without logging in.
2. **Install and log in:**
   ```
   cd worker
   npm install
   npx wrangler login
   ```
3. **Create the database** and paste the printed `database_id` into
   `wrangler.toml`:
   ```
   npx wrangler d1 create superrams-fan-feed
   npm run db:migrate
   ```
4. **Set the list URL** as `BSKY_LIST` in `wrangler.toml`.
5. **Set the read token** (any long random string; keep a copy for step 7):
   ```
   openssl rand -hex 32
   npx wrangler secret put READ_TOKEN
   ```
6. **Deploy:** `npm run deploy`. Note the `*.workers.dev` URL it prints.
7. **Point the client at it.** In the Claude cloud environment settings add a
   secret: type Bearer, allowed website = the Worker's hostname, header
   `Authorization`, prefix `Bearer`, value = the token. Also add
   `FAN_FEED_URL=https://superrams-fan-feed.<account>.workers.dev` as an
   environment variable, and allow the Worker's hostname in the network
   settings. Locally, set `FAN_FEED_URL` and `FAN_FEED_TOKEN` instead.

## Fixtures

The Worker only polls around fixtures it knows about. The fixture id is the
match date in UK time. Add each one with its UK offset (`+00:00` GMT,
`+01:00` BST):

```
python3 tools/bluesky_digest.py add --kickoff 2026-11-28T15:00:00+00:00 --opponent "Hull City" --competition "EFL Championship"
python3 tools/bluesky_digest.py add --kickoff 2026-12-05T12:30:00+00:00 --opponent "Leeds United" --away
python3 tools/bluesky_digest.py fixtures
```

If kick-off moves, run `add` again with the same date and it updates in place.
If it moves to a different date, `remove` the old one first.

## Getting the digest

```
python3 tools/bluesky_digest.py match 2026-11-28
python3 tools/bluesky_digest.py match 2026-11-28 --json --out /tmp/feed.json
```

The match phases are estimated from kick-off and ignore stoppage time, so use
them as a guide rather than as the minute something happened.

## Testing locally

```
cp .dev.vars.example .dev.vars
npm run db:migrate:local
npm run dev
curl "http://localhost:8787/__scheduled?cron=*/5+*+*+*+*"   # fire the cron
```

`POST /poll?fixture=<date>` polls straight away, ignoring the window. The list
feed only goes back so far, so it's only useful around a match.

## Config (`wrangler.toml` vars)

| Var | Default | Meaning |
|---|---|---|
| `BSKY_LIST` | | bsky.app list URL or `at://` list URI |
| `BSKY_API` | `https://public.api.bsky.app` | AppView to read from |
| `WINDOW_BEFORE_MIN` | 120 | start polling this long before kick-off |
| `WINDOW_AFTER_MIN` | 180 | stop polling this long after kick-off |
| `REFRESH_AFTER_MIN` | 60 | refresh counts this long after the window closes |

## Fair use

These are other people's posts. Use the digest for the mood and talking
points, and credit and link anyone quoted in a SuperRams post.
