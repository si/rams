# SuperRams Relaunch — 2026/27 Championship Season

Context and strategy captured from planning discussion, 2026-07-31. This is the
working knowledge base for the relaunch — update it as decisions evolve.

## Vision

Relaunch superrams.com for the 2026/27 Championship season as the front door to
a single, reunited Derby County fan community. SuperRams has 15 years of
community-building behind it, spread thin across multiple social networks.
The goal is to pull those separate audiences into one home — Patreon — where
content can be shared, a community can be rebuilt, and (eventually)
monetised.

## Where the audience currently sits

| Platform | Followers | Notes |
|---|---|---|
| X (Twitter) | ~13,000 | Legacy audience from the "good days" — biggest single pool, mass-market reach |
| Facebook | ~1,300 | Still active, mass-market |
| Bluesky | ~700 | Growing again, but skews niche/geeky — not a mass audience yet |

Strategy: seed and pull followers from X and Facebook (the mass-market
channels) toward Patreon, rather than trying to rebuild mass reach natively on
Bluesky.

## Hub: Patreon

Patreon is the destination hub — community, content, and (later) monetisation
all live there. Advice below is from a call with **Jesse (Patreon advisor)**.

### Jesse's recommended approach
- Start with a **free plan/tier**. Don't gate anything behind payment yet.
- Publish a **variety of content formats** early to see what resonates before
  committing to one format.
- For audio/video: publish the **full version to Patreon members only**, then
  **clip and share highlights across the socials** (X, Facebook, Bluesky) to
  pull people through to the full piece on Patreon.
- Revisit a **paid tier with exclusive content** later, once there's
  demonstrated appetite/demand — not on day one.
- **Podcast hosting**: host on Patreon; exclusive/paywalled episodes can still
  be **syndicated out to Apple Podcasts, Spotify**, etc. once there's a public
  version to syndicate.

### Why Patreon over other platforms right now
- Deliberately **not building on YouTube for now** — focus stays on Patreon's
  community tools instead of spreading effort across another platform.
- Deliberately **avoiding "true fan"-style tokenised/crypto-adjacent
  platforms** or clever/complex tech. The audience is mass-market UK football
  fans — the platform choice needs to stay simple and familiar, not
  Web3-flavoured.
- Patreon gives mobile access and enough flexibility (posts, audio, video,
  membership tiers) without over-engineering the tech stack.

## Content plan — phased rollout

1. **Phase 1 — Text.** Match day analysis, published the day after each game,
   with a cheeky pundit/fan perspective (not neutral, not official-club tone).
2. **Phase 2 — Audio/video.** Add audio and/or video versions of the same
   match day analysis once the format is proven.
3. **Phase 3 — Interviews/chat.** Once the right audience and guests are in
   place, introduce interviews and conversations with vocal Derby County fans
   — reigniting the kind of community energy SuperRams had on Twitter in its
   strongest days.

Tone throughout: fan-first, cheeky pundit perspective — not the club's
official PR voice.

## Repo's role

This repository is the working knowledge base for the relaunch: strategy
docs (this file), and eventually the structured match day content pipeline.

Planned workflow:
1. After each match, pull match day statistics.
2. Structure that data into an agreed content format (to be defined — see
   Open questions).
3. Use Claude to turn the structured stats into the cheeky-pundit match day
   analysis (text first, audio/video later).
4. Publish the generated content to Patreon; clip highlights out to the
   socials to drive traffic back to Patreon.

## Open questions / next steps

- Define the exact structure/schema for match day statistics input (what
  stats, what format) so Claude can generate consistent analysis from it.
- Confirm the actual SuperRams-branded handles on X, Facebook, and Bluesky to
  use for cross-promotion (the current `index.html`/`README.md` link to the
  official Derby County club accounts, not the personal SuperRams community
  accounts — needs correcting once the real handles are confirmed).
- Decide Patreon tier names/structure once the free-tier content has run long
  enough to gauge demand.
- Identify which vocal Derby County fans to approach for Phase 3
  interviews/chat.
