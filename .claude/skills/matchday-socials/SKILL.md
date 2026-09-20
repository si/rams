---
name: matchday-socials
description: Draft SuperRams pre-match hype posts for X, Bluesky and Facebook ahead of a Derby County game. Use whenever asked to draft/write "the socials" for an upcoming/tomorrow's/today's game — distinct from patreon-match-post, which is the day-after report. Triggers include "draft the socials", "matchday posts", or a fixture name plus "for tomorrow's game".
---

# SuperRams matchday socials

Pre-match hype copy for X, Bluesky and Facebook, posted the day of or day
before a Derby County fixture. Established drafting the Burnley (a) preview,
19 September 2026 — treat `posts/2026-09-19-preview-derby-burnley-socials.md`
as the worked example.

## Naming: session, branch, PR

Same rule as `patreon-match-post` — name the session title, and any PR
that comes out of this branch, around the fixture and date (e.g.
"Burnley preview (19 Sep 2026)"), not a generic description. See that
skill's "Naming: session, branch, PR" section for the full rationale and
format — it applies here too, since a branch often carries both the
pre-match socials and the day-after report together.

## Always output copy-paste text blocks in chat

**Every time these are drafted, reply with the three platform posts as plain
text blocks the user can copy straight out of chat** — not just saved to a
file. Saving the draft to `posts/` is still useful for the archive, but the
chat reply is the actual deliverable Si needs; don't make him open the repo
file to get the copy.

## Process

1. Find the actual fixture (opponent, venue, kick-off, date) — web search if
   not obviously known.
2. Pull current form/context (recent results, league position) to ground the
   tone — don't write generic hype divorced from how the season's actually
   going.
3. Draft three short posts: X, Bluesky, Facebook.
   - **Facebook stays under ~120 characters, one short punchy line, no
     link/image** — short enough to qualify for Facebook's colourful
     big-text background treatment rather than sitting as a plain grey
     wall of text. Longer copy loses that formatting, so don't let it run
     on.
   - X and Bluesky stay tight too, but aren't bound by that 120-char cap.
4. Save the draft to `posts/<date>-preview-<opponent>-socials.md` (same
   `posts/` folder the Patreon reports use), with a short front-matter note
   on status/context/what's unverified (e.g. no confirmed XI yet).
5. Reply in chat with the three text blocks, ready to copy-paste.

## Tone rules (shared with patreon-match-post)

- UK-fan voice: sass, self-deprecating humour about the club's own chaos.
- Be honest about a bad run rather than dodging it — leaning into current
  form (a losing streak, a struggling opponent) reads more genuine than
  pretending every game is a big occasion.
- Careful/light with the opposition — a fair, brief nod to their situation
  is fine, no need to kick a team that's also struggling.
- No corporate-safe hedging. Say what a fan in the pub would say.

## Known constraints

- Team news/starting XI usually isn't confirmed the night before — don't
  invent a lineup. If it drops before kick-off, a short follow-up post
  naming the XI is a nice-to-have, not a requirement for these three.
- **No "find us on Bluesky/Facebook/X" CTA in these three posts** —
  each one is already posted natively on the platform it's promoting, so a
  cross-channel plug doesn't fit, and Facebook's version is capped at
  ~120 characters with no room for one anyway. That CTA block is standard
  on the longer-form Patreon match report instead (see
  `patreon-match-post`'s "FIND MORE SUPERRAMS" section) — don't duplicate
  it here.
