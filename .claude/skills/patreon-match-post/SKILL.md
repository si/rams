---
name: patreon-match-post
description: Draft a SuperRams Patreon match-report post in the established format — free teaser + paywalled full post, Derby County (Rams) players only, simplified stats block, fan-voice tone with sass and snark. Use whenever drafting or revising a SuperRams Patreon post for a Derby County match. Triggers include "Patreon post", "match report", a fixture name plus "write up/draft", or "our standard format".
---

# SuperRams Patreon match-post format

This skill documents the exact structure and rules for a SuperRams matchday Patreon
post, established while drafting the Rotherham United 1-1 Derby County post
(4 August 2026, published at
https://www.patreon.com/derbycounty/posts/rotherham-1-1-165840685). Treat that
post — archived in full at `posts/2026-08-04-rotherham-1-1-derby.md` (repo
root) — as the canonical worked example. When in doubt about tone or structure, match it.

## Why this format

SuperRams' USP is **the players and the fans**, not being a stats/news aggregator —
that's what AFTV, TAW, and every score-app already do. Two consequences that
shape every decision below:

- **Cover Derby players only.** Never build out the opponent's full lineup,
  player-by-player analysis, or opponent stats beyond what's needed to tell
  the story of the match (e.g. who scored, who conceded a penalty). This
  isn't laziness — it's the point. It also means every post adds to a running
  per-player knowledge base (see "Player tracker" below) instead of spreading
  effort thin across 20+ players fans don't actually follow.
- **Content flow is "day after," not matchday.** Produce the write-up the day
  after kick-off, per the wider SuperRams Fan Voices content plan
  (`superrams-fan-voices-launch-plan.md` in Drive).

## Post structure (in order)

1. **Title** — short, punchy, includes the score. e.g. "Rotherham 1-1 Derby:
   last dress rehearsal, and about a thousand of us bothered to watch it"
2. **Public preview** (above the paywall) — one paragraph, free to all. Sets
   up the result and the one detail worth teasing, ends on a hook pointing to
   the paywalled section. This is the only part non-patrons ever see.
3. **— Paywall —** (Patreon's native "Add paywall" divider, inserted manually
   in the editor — there is no way to script this via the API/automation
   layer; see "Known constraints" below)
4. **THE MATCH** — fixture, competition, venue, date/kick-off. Bullet list,
   no table (Patreon's editor doesn't render markdown tables).
5. **STARTING XI — THE RAMS** — Derby's XI only. One heading line per player:
   `<shirt-colour icon> #<squad number> — <Name>`. Use ⚪ for Derby (the
   club's identifying colour) regardless of which actual kit was worn; mark
   any unconfirmed squad number as `#TBC` rather than guessing — squad
   numbers get reissued every season and conflicting sources are common.
   Flag TBC entries explicitly to the user so they can verify before
   publishing.
6. **SUBS — WHO CAME OFF, WHO CAME ON** — one line per substitution, minute
   bolded as the anchor, unicode arrows mapping the change:
   `**<minute>'** <player off> ↓ · ↑ <player on>`
7. **THE PEOPLE, NOT JUST THE SHEET** — the heart of the post. One heading
   per Derby player worth a mention (not every player needs one), each
   followed by a short paragraph of personality-driven commentary. This is
   where the sass lives — see "Tone" below. Never give the opposition this
   treatment.
8. **STATS SNAPSHOT** — exactly four lines, no more:
   - `Goals:` `<minute>' <player> (pen if penalty)`, comma/line-separated for
     multiple
   - `Bookings:` `(<minute>) <player> (yellow/red)`, or "none reported"
   - `Attendance:` official figure if published, plus "(Derby County fans:
     <n>)" if known; if no official figure exists, say so explicitly and
     give whatever qualitative detail is available (e.g. stands closed, away
     end size) rather than inventing a number
   - `Distance travelled:` miles from Pride Park — **away games only**, omit
     entirely for home fixtures
9. **THE READ** — one short paragraph of analysis/opinion tying the match to
   what's coming next.
10. **WHAT'S NEXT** — the next fixture, bolded, with date/competition.
11. **IN THEIR WORDS** — 2-3 pulled fan quotes from Bluesky/Facebook. **If
    there's nothing to pull** (common for quiet pre-season friendlies),
    don't leave a placeholder gap — either cut the section or replace it with
    a direct comment-seeding prompt tied to something specific from the match
    (see the Rotherham example for how this played out).

## Tone rules

- UK-fan voice: sass, snark, self-deprecating humour about the club's own
  chaos. This is what makes it a fan site and not a press release.
- **Be freely, harshly critical of our own players and manager.** That's
  earned; we're the ones who show up.
- **Be careful/light with opponents.** A fair compliment when genuinely
  earned (e.g. a good goal) is fine and actually lands better coming from a
  rival fan; never build out opponent analysis beyond a sentence or two of
  color needed to tell the story.
- No corporate-safe hedging. Say what a fan in the pub would say.

## Player tracker

Every post updates `SuperRams — Player Tracker 2026-27` (Google Sheet) — one
row per Derby player who featured, tracking Starts / Sub Appearances / Total
Appearances / Goals / Assists / Yellow / Red / Last Updated / Notes. This is
the season-long knowledge base the "Rams only" focus is building toward —
check it before writing player commentary so recurring notes (form, role
changes, injury history) can build on what's already there instead of
re-discovering it each week.

## Known constraints (as of Aug 2026)

- **No Patreon connector/API path exists for creating or formatting posts.**
  Zapier's Patreon integration only covers membership/pledge events, IFTTT
  can trigger off new posts but can't create them, and n8n has no dedicated
  create-post action — Patreon's public API doesn't expose post creation to
  third parties. Draft here, then copy-paste manually into Patreon's editor.
- Patreon's editor drops markdown tables and often strips emoji on paste —
  use bullet lists instead of tables, and retype the handful of emoji that
  matter (⚽, 🔄) directly in the editor rather than relying on paste.
- Bold the section headers manually after pasting; plain-text paste won't
  carry formatting.
- Canva MCP image generation has been unreliable in this environment
  (permission/approval errors on save). If it fails, generate the design
  anyway, then manually download it from the Canva web link and upload it to
  Patreon directly — don't block the post on the automation working.

## Data-gathering checklist

Before drafting, confirm:
- [ ] Final score, competition, venue, date/kick-off
- [ ] Derby's starting XI with squad numbers (flag any unconfirmed)
- [ ] Substitutions with minutes
- [ ] Goalscorers with minutes (and pen/own-goal flags)
- [ ] Bookings, if any
- [ ] Attendance — official figure or best available reported detail
- [ ] Distance from Pride Park (away games only)
- [ ] Next fixture

## Reference material

- Full worked example: `../../../posts/2026-08-04-rotherham-1-1-derby.md`
  (i.e. `posts/` at the repo root — every published post gets archived there,
  one file per post)
- Wider content strategy: `superrams-fan-voices-launch-plan.md` (Google Drive)
- Season-long stats: `SuperRams — Player Tracker 2026-27` (Google Sheet)
