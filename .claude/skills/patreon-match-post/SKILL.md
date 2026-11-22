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

**All headings and sub-headings are real Markdown** (`##` for section
headings, `###` for player names within "The People, Not Just the Sheet")
— not plain-text/ALL-CAPS lines with bold applied after pasting. Established
in the Burnley 1-1 Derby post (19 September 2026), overriding the earlier
plain-text approach the Rotherham example used.

1. **Title** — short, punchy, includes the score. e.g. "Rotherham 1-1 Derby:
   last dress rehearsal, and about a thousand of us bothered to watch it"
2. **Public preview** (above the paywall) — free to all. **Break at the end
   of each sentence** — one sentence per line/paragraph, not one dense
   block — so it reads easily as a teaser. Sets up the result and the one
   detail worth teasing, ends on a hook pointing to the paywalled section.
   This is the only part non-patrons ever see.
3. **— Paywall —** (Patreon's native "Add paywall" divider, inserted manually
   in the editor — there is no way to script this via the API/automation
   layer; see "Known constraints" below)
4. **## The Match** — no emoji. Four lines, one fact per line, in this
   exact order: competition, fixture, date & time, venue. e.g.:
   ```
   ## The Match

   EFL Championship, Matchday 8
   Burnley vs Derby County
   Saturday 19 September 2026, KO 15:00
   Turf Moor, Burnley
   ```
5. **## Starting XI Rams** — Derby's XI only. One line per player:
   `<shirt-colour icon> #<squad number> — <Name>`. Use ⚪ for Derby (the
   club's identifying colour) regardless of which actual kit was worn; mark
   any unconfirmed squad number as `#TBC` rather than guessing — squad
   numbers get reissued every season and conflicting sources are common.
   Flag TBC entries explicitly to the user so they can verify before
   publishing.
6. **## Subs** — just "Subs", no explanatory suffix after it. One line per
   substitution, minute bolded as the anchor, unicode arrows mapping the
   change: `**<minute>'** <player off> ↓ · ↑ <player on>`
7. **## The People, Not Just the Sheet** — the heart of the post. One `###`
   sub-heading per Derby player worth a mention (not every player needs
   one), each followed by a short paragraph of personality-driven
   commentary. This is where the sass lives — see "Tone" below. Never give
   the opposition this treatment.
8. **## Stats Snapshot** — exactly four lines, no more:
   - `Goals:` `<minute>' <player> (pen if penalty)`, comma/line-separated for
     multiple
   - `Bookings:` `(<minute>) <player> (yellow/red)`, or "none reported"
   - `Attendance:` official figure if published, plus "(Derby County fans:
     <n>)" if known; if no official figure exists, say so explicitly and
     give whatever qualitative detail is available (e.g. stands closed, away
     end size) rather than inventing a number
   - `Distance travelled:` miles from Pride Park — **away games only**, omit
     entirely for home fixtures
9. **## The Read** — analysis/opinion tying the match to what's coming
   next, **broken into small paragraphs** rather than one dense block — a
   new paragraph every 2-3 sentences or whenever the angle shifts.
10. **## Standings** (renamed from "League Table Snapshot") — Derby's
    position plus their nearest neighbours, above and below, in the
    Championship table as it stands after this match.

    **Generate the table image with `tools/standings_image.py`** (the
    standard case, established with the Southampton 2-0 Derby post, 21
    November 2026). It replaces cropping Si's screenshots. Precede the
    image with one natural sentence giving Derby's own numbers plus who's
    immediately above and below, so the headline fact reads even before
    the image loads/for anyone skimming — not the terse
    `pos. Team — P· Pts· GD` shorthand, an actual sentence:
    "Derby are now `<pos>`(th/st/nd/rd) in the table with `<points>`
    points from `<played>` games and a goal difference of `<GD>`, above
    `<team below>` and below `<team above>`."
    e.g. "Derby are now 22nd in the table with 5 points from 8 games and
    a goal difference of -7, above Preston North End and below Bolton
    Wanderers." Then the image directly below it.

    Run, one `pos|team|played|points|gd` argument per row, top to bottom:
    ```
    python3 tools/standings_image.py \
      posts/assets/<post-slug>/standings.png \
      "20|Lincoln City|16|15|-12" "21|Watford|16|15|-14" \
      "22|Burnley|15|10|-9" "23|Derby County|16|10|-18" \
      "24|Preston North End|16|9|-17"
    ```
    Output: white background, black horizontal rules only (no vertical
    lines), columns Pos / Team / P / Pts / GD, Derby's row in luminous
    yellow with a thick border, and a dotted line under 21st marking the
    relegation line. Flags: `--highlight "<team>"` (default Derby County),
    `--relegation-after <pos>` (default 21; `0` turns it off, e.g. if the
    five rows don't straddle the line it simply won't appear).

    Embed it in the draft with alt text listing every row, so the data
    survives for screen readers and if the image fails:
    `![Championship table, 20th to 24th: 20 Lincoln City, P16, 15 pts, GD -12. ... 23 Derby County (highlighted), ...](assets/<post-slug>/standings.png)`
    Send the PNG to Si as well, since Patreon needs it uploaded by hand.

    Rows: two teams above and two below Derby is the default (five rows
    total); trim to what's actually available at the very top or bottom
    of the table (e.g. only one team below Derby if Derby's 23rd of 24).
    Source from fixtur.es where reachable, otherwise the best corroborated
    WebSearch summary (eflchampionship.co.uk summaries have been the most
    complete) — **flag explicitly if the table is pulled pre-match rather
    than confirmed post-match** (results across the whole division lag in
    search indexes), and flag any neighbour with a game still to play
    before the post goes out, rather than silently presenting stale
    positions as current. Sanity-check Derby's line against the pre-match
    table plus this result.

    **If Si supplies a table screenshot instead**, crop it to the same
    five rows and use that. **If the script can't run**, fall back to a
    bullet list (no markdown table — see "Known constraints"), one line
    per team, `<pos>. <Team> — P<played> · Pts<points> · GD<goal difference>`,
    with Derby's row bolded.
11. **## In Their Words** — 2-3 pulled fan quotes from Bluesky/Facebook,
    formatted as **Markdown pull quotes**: `> "<quote>"` on its own block,
    with the attribution on the line directly after (still inside or
    immediately below the blockquote), e.g.:
    ```
    > "It'll be a result that will bring many mixed emotions..."
    > — @derbydaniel.bsky.social
    ```
    **If there's nothing to pull** (common for quiet pre-season friendlies),
    don't leave a placeholder gap — either cut the section or replace it with
    a direct comment-seeding prompt tied to something specific from the match
    (see the Rotherham example for how this played out).
12. **## Find More SuperRams** — standard CTA block, identical every post,
    pointing readers at the other channels. Always include, in this order:
    - Bluesky: [@derbycounty.bsky.social](https://bsky.app/profile/derbycounty.bsky.social)
    - Facebook: [Derby County Rams](https://www.facebook.com/derbycountyrams)
    - X: [@derbycounty](https://x.com/derbycounty)
    One short line of framing above the links (e.g. "More Rams chat, every
    day, not just matchday:") — keep it brief, this isn't the place for more
    sass, just a clear pointer to where the rest of the community hangs out.
13. **## What's Next** — **the last section in the post**, after Find More
    SuperRams. Format: team, home/away, date and time, then how many days
    away that is from this match, e.g.:
    ```
    ## What's Next

    Wrexham — Home — Saturday 10 October 2026, KO 15:00 (21 days)
    ```
    Cite [fixtur.es](https://fixtur.es) as the source for the fixture
    date/KO (Si's preferred fixture-list reference) — link it inline, e.g.
    "per [fixtur.es](https://fixtur.es/en/team/derby-county)". If this
    session's WebFetch can't reach fixtur.es directly (a recurring network
    constraint — see "Known constraints"), still cite it as the reference
    and get the actual date/time from WebSearch, flagging if the two don't
    obviously agree.

## Hero image

Generate it with `tools/cover_image.js` (1920x1080 JPG), which recreates
Si's Canva cover style: diagonal split in each club's spot colour (home
left, away right), crests in white circles, score in the middle, club names
underneath in white Alfa Slab One with a black outline, "EFL Championship <Day D Mon YYYY>"
across the top (`--competition` to change it for cup games) and a subtle
SuperRams.com watermark on the diagonal at the bottom.

```
node tools/cover_image.js posts/assets/<slug>/hero-<slug>.jpg "<Home>" "<Away>" "<h> - <a>" --date YYYY-MM-DD
```

- Team names must match `tools/club_colours.json` / the crest slugs
  (e.g. "Derby County", "Preston North End"). Derby uses the ram head
  (`tools/crests/derby-county.svg`), everyone else their ESPN crest.
- Override a colour with `--home-colour "#hex"` / `--away-colour "#hex"`
  if a kit/crest colour reads better for that fixture.
- Look at the output before using it: long names auto-shrink to stay on
  their side of the diagonal, but check nothing crosses it.
- Si's original Canva template is still at https://canva.link/zhp1gafamj0uzsa
  if he wants to hand-tweak one.

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
- Draft with real Markdown headings (`##`/`###`) per "Post structure"
  above. Patreon's editor generally converts pasted Markdown headings to
  its own heading styles on paste, but **verify after pasting** the same
  way as the ⚪ icon above — if a heading pastes as plain text instead,
  reapply Patreon's heading style by hand rather than leaving it flat.
- Canva MCP image generation has been unreliable in this environment
  (permission/approval errors on save). If it fails, generate the design
  anyway, then manually download it from the Canva web link and upload it to
  Patreon directly — don't block the post on the automation working.
- **WebFetch is blocked for essentially every sports domain tried in this
  environment** — dcfc.co.uk, Sky Sports, Shropshire Star, fixtur.es,
  footballwebpages.co.uk, worldfootball.net, even en.wikipedia.org have all
  returned `EGRESS_BLOCKED`. In practice this means fixture dates and the
  league table snapshot come from WebSearch's summarized snippets, not a
  page read directly — cite fixtur.es as the reference per #10/#11 above
  regardless, but flag when the underlying numbers are search-summary-only
  rather than fetched and cross-checked.

## Data-gathering checklist

Before drafting, confirm:
- [ ] Final score, competition, venue, date/kick-off
- [ ] Derby's starting XI with squad numbers (flag any unconfirmed)
- [ ] Substitutions with minutes
- [ ] Goalscorers with minutes (and pen/own-goal flags)
- [ ] Bookings, if any
- [ ] Attendance — official figure or best available reported detail
- [ ] Distance from Pride Park (away games only)
- [ ] Next fixture, per fixtur.es
- [ ] Current league table position for Derby and their nearest neighbours,
      rendered with `tools/standings_image.py`
- [ ] Find More SuperRams CTA block included (standard, every post — see
      "Post structure" #13)
- [ ] Hero image generated with `tools/cover_image.js` and checked (see "Hero image" section)

## Reference material

- Full worked example: `../../../posts/2026-08-04-rotherham-1-1-derby.md`
  (i.e. `posts/` at the repo root — every published post gets archived there,
  one file per post)
- Wider content strategy: `superrams-fan-voices-launch-plan.md` (Google Drive)
- Season-long stats: `SuperRams — Player Tracker 2026-27` (Google Sheet)
