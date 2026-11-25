# tools

## standings_image.py

Renders the Patreon post's Standings table as a PNG: white background,
horizontal rules only, columns Pos / Team / P / Pts / GD, the highlighted
team in luminous yellow with a thick border, and a dotted relegation line.

```
python3 tools/standings_image.py posts/assets/<post-slug>/standings.png \
  "22|Burnley|15|10|-9" "23|Derby County|16|10|-18" ...
```

- `--highlight "<team>"`: row to highlight (default `Derby County`)
- `--relegation-after <pos>`: dotted line under this position (default 21, `0` to disable)
- `--crests <dir>`: folder of `<team-slug>.png` crests, drawn as round avatars by the team name (default `tools/crests/`, missing ones skipped)

Needs Pillow and the Inter font (both present in the cloud container).

## buffer.py

Posts to Buffer via its GraphQL API using a per-brand personal access key, kept
separate from any OAuth Buffer connector.

### Authentication

Two ways to supply the key. Neither puts a key in the repo.

**1. Proxy secret (preferred in cloud sessions).** Add a secret in the cloud
environment settings (Add secret):

| Field | Value |
|---|---|
| Secret type | Bearer |
| Allowed websites | `api.buffer.com` |
| Path prefixes | leave empty |
| Custom header | `Authorization`, prefix `Bearer`, value = the API key |

Get the key from https://publish.buffer.com/settings/api (logged in to the
right brand's Buffer account). Start a new session after adding it. With no
env var set, `buffer.py` sends no `Authorization` header and the proxy injects
the key.

A host can only carry one key per environment, so use one environment per
brand (the secret on `api.buffer.com` is that environment's brand).

**2. Env var.** If set, the script sends it as the bearer token and the proxy
secret isn't needed:

| Brand | Env var |
|---|---|
| superrams | `BUFFER_API_KEY_SUPERRAMS` |
| housefinesse | `BUFFER_API_KEY_HOUSEFINESSE` |
| petals | `BUFFER_API_KEY_PETALS` |

### Usage

```
python3 tools/buffer.py superrams account
python3 tools/buffer.py superrams channels --org ORG_ID
python3 tools/buffer.py superrams post --channel CHANNEL_ID --text "COYR" --dry-run
python3 tools/buffer.py superrams post --channel CHANNEL_ID --text "COYR"                      # add to queue
python3 tools/buffer.py superrams post --channel CHANNEL_ID --text "COYR" --due-at 2026-10-31T09:00:00+00:00
python3 tools/buffer.py superrams post --channel CHANNEL_ID --text "COYR" --now               # straight away
python3 tools/buffer.py superrams post --channel CHANNEL_ID --text "COYR" --image URL --alt "..." --now  # with an image
```

`--image` takes a public image URL. The repo is public, so use the raw GitHub
link pinned to a commit, e.g.
`https://raw.githubusercontent.com/si/rams/<sha>/posts/assets/<slug>/hero-<slug>.jpg`
(push the image first). The Buffer MCP connector is signed in to a different
account and gets 403 on these channels, so always post through this script.

`--due-at` needs the UK offset: `+00:00` in winter (GMT), `+01:00` in summer (BST).

### SuperRams IDs

| Item | ID |
|---|---|
| Organisation (Super Rams) | `6a800dcea10846fbbd0a34cc` |
| X: `derbycounty` | `6a8855a1ccaf649a67ebbd7d` |
| Bluesky: Derby County | `6a802be6b2d9d57743808545` |

There's no Facebook channel connected in Buffer, so Facebook copy still needs
posting by hand.

## Cover images

`node tools/cover_image.js <out.jpg> "<Home>" "<Away>" "<score>" --date YYYY-MM-DD` renders the
1920x1080 match cover: diagonal split in club spot colours
(`club_colours.json`), crests in white circles (`crests/`), score and names in
white Alfa Slab One type (`fonts/alfa-slab-one.woff2`, OFL), with "EFL Championship Sat 21 Nov 2026" style header (`--competition` overrides) and a subtle SUPERRAMS.COM watermark bottom centre. Uses the pre-installed
Playwright/Chromium. `--home-colour` / `--away-colour` override a colour.

## Patreon handoff

`python3 tools/patreon_handoff.py posts/<post>.md <out.html>` builds a page
with every Patreon field in paste order (cover, title, preview, body split at
its images, image descriptions) plus copy buttons, and the post's "Still open"
items as pre-publish checks. Publish it as an Artifact with
`{"downloads": true}`. This is the last step before merging a match post.
