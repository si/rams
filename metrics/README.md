# Social vanity-metrics tracking

Weekly follower/like counts for SuperRams' Bluesky, Facebook, X and Patreon
accounts, logged to `follower-log.md` in this folder.

## Accounts tracked

- **Bluesky**: [@derbycounty.bsky.social](https://bsky.app/profile/derbycounty.bsky.social)
- **Facebook**: [Derby County Rams](https://www.facebook.com/derbycountyrams)
- **X**: [@derbycounty](https://x.com/derbycounty)
- **Patreon**: [derbycounty](https://www.patreon.com/derbycounty)

Patreon's public creator page shows both a patron count (paying members) and
sometimes a separate follower count (free, non-paying). Log whichever
number(s) are visible and note in the log row which is which — see
`follower-log.md`'s "Secondary metric" column.

## Why this is manual for now

Automating this fully was the first thing tried, and it's worth recording
why it didn't work rather than re-discovering it each week:

- **Buffer** (already connected, MCP available) doesn't expose follower/like
  counts anywhere in its API — `get_channel` returns posting schedule and
  config, not audience size, and `get_aggregated_post_metrics` is post-level
  engagement (reactions/comments/reach), not profile totals. It's also not
  currently connected to any of the three SuperRams accounts — only Si's
  personal Threads/Bluesky/LinkedIn, and the org's plan caps out at 3
  channels total, so adding SuperRams' accounts would mean dropping one of
  those first.
- **Direct fetches from this session** (Bash/curl, WebFetch) are blocked by
  the environment's network egress policy for social platform domains —
  confirmed against `bsky.app` and `public.api.bsky.app` directly (both
  returned egress-blocked errors), and Facebook/X are almost certainly the
  same since they're not on the proxy's allowlist either.
- **Zapier** (connected, MCP available) does have real connector apps for
  Facebook Pages (5 read actions) and Bluesky (5 read actions) that could
  plausibly pull follower counts server-side, sidestepping this session's
  network restriction — but nothing usable for X specifically (its
  follower-count API sits behind X's paid tier, and no Zapier "X/Twitter
  followers" action turned up in the catalog). Using the Facebook/Bluesky
  route means Si connecting those accounts to Zapier first. Worth revisiting
  if the weekly manual check gets old — see "Automating further" below.

So for now: quick manual check, logged by Claude on request.

## Weekly process

Every Monday, a scheduled check-in fires with the four links posted directly
in chat. An artifact with clickable link cards was tried for one check-in,
matching the copy-sheet pattern from the match-post workflow, but on Si's
iOS client the artifact viewer's sandbox blocks the page's own outbound
links from opening (a `target="_blank"` link inside the sandboxed preview
frame doesn't navigate) — plain chat links, which iOS opens natively, work
where the artifact didn't. Reply with whatever's visible on each page for:

- Bluesky: followers
- Facebook: Page likes and Page followers
- X: followers
- Patreon: patron count (and follower count too, if shown separately)

Claude appends a row per platform to `follower-log.md` with the date, and
commits/pushes the update. Takes about two minutes end to end.

## Automating further

If the weekly manual check becomes a chore, the Zapier route (Facebook Pages
+ Bluesky "Get Profile"/"Find Page" read actions) is the most promising next
step — it would need:

1. Si connecting the SuperRams Facebook Page and Bluesky account to Zapier
   (OAuth, done once).
2. Enabling the relevant read actions via `enable_zapier_action`.
3. A weekly trigger that calls those actions instead of asking Si directly.

X would stay manual regardless, since there's no free API path to its
follower count. Patreon does have a public API that exposes patron counts
for a creator's own account, but it wasn't investigated when this was
written — worth a look if the manual check becomes tedious across four
platforms instead of three.
