---
name: patreon-match-post
description: Draft SuperRams matchday content in the established format — either the day-after Patreon match-report (free teaser + paywalled full post, Derby County players only, fan-voice tone with sass and snark) or the matchday pre-match socials (short Bluesky/X + Facebook hype posts, same voice). Use whenever drafting or revising a SuperRams Patreon post for a Derby County match, OR whenever checking if Derby play today and drafting socials for that game. Triggers include "Patreon post", "match report", a fixture name plus "write up/draft", "our standard format", "matchday socials", "draft socials for the game", or "are Derby playing today".
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

## Matchday pre-match socials

On matchday itself (before kick-off, so the day-after Patreon report isn't
possible yet — no score/lineups/stats exist), a lighter deliverable covers
the gap: short hype posts for the SuperRams Bluesky/X and Facebook accounts,
same fan voice as the Patreon post. Established while drafting the Derby v
Birmingham City game (12 September 2026); canonical example at
`../../../posts/2026-09-12-derby-birmingham-social-prematch.md`.

Do this every time a scheduled or ad-hoc check finds Derby playing that day:

1. **Confirm the fixture** — opponent, competition, venue, date/kick-off
   (WebSearch; direct fetches to dcfc.co.uk/Sky Sports/ESPN are blocked by
   this environment's egress policy, so rely on search summaries and flag
   anything single-sourced).
2. **Gather quick context** — recent form (last result, home/away run),
   table position, head-to-head, and team news/injuries for both sides.
   Keep it brief; this isn't the full data-gathering checklist below.
3. **Draft two posts, not one per platform beyond this:**
   - **Bluesky/X** — one post, comfortably under 280 characters (fits both
     platforms' limits with room to spare). Punchy, sub-one-paragraph.
   - **Facebook** — a longer, more conversational version of the same
     hype, 2-3 short paragraphs.
   Same tone rules as below: harsh/self-deprecating about Derby, light on
   the opponent. Lead with "MATCHDAY" and the kick-off time; work in the
   sharpest piece of context (a bad run, a key absence, a chance to catch
   the opponent cold).
4. **Save the draft** to `posts/<match-date>-<opponent>-social-prematch.md`
   (repo root `posts/`, same folder as full match reports) — fixture facts,
   team news, the two post drafts in fenced code blocks with character
   counts, a reminder that the full Patreon report is still a day-after job
   once the result's in, and sources.
5. **Commit and push** the draft file to the working branch, same as any
   other repo change.
6. **Create a TickTick task** to review and post the drafts manually
   (Bluesky/X/Facebook aren't connected to Buffer — see
   `metrics/README.md`), in the **🐏Rams** project
   (`6a6d92ca5ef551dc12627923`), titled `Review matchday socials — <fixture>
   (<KO time> KO)`, due 6 hours before kick-off, with the draft file path in
   the task content.
7. **Give the user the two post texts directly, copy-paste ready** — don't
   make them open the repo file to get the copy. The saved file is the
   archive/audit trail, not the delivery mechanism.

These are drafts for Si to post manually — never publish to Buffer or any
social platform directly; there's no connected SuperRams channel to do so
even if a tool existed for it.

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
  use bullet lists instead of tables. The Rotherham post shipped with
  "very minimal emoji" surviving, despite the draft using ⚪ (once per
  lineup entry — this is the shirt-colour icon the whole "STARTING XI"
  format depends on), plus 📍 🗓️ 👇 🗣️ elsewhere. **⚪ is the highest-risk
  one to lose** since a stripped icon silently degrades the lineup back to
  an unlabeled list with no visual indication anything went wrong. After
  pasting, always verify the lineup icons actually rendered before
  publishing — don't assume paste preserved them, and retype by hand in the
  editor if it didn't.
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
