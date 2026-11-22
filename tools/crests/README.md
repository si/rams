# Club crests

One PNG per club, named by slug of the team name as it appears in the
standings rows (lowercase, non-alphanumerics to hyphens):

- `derby-county.png`, `southampton.png`, `burnley.png`, `watford.png`,
  `lincoln-city.png`, `preston-north-end.png`, ...

Transparent background preferred. `standings_image.py` draws each one as a
small round avatar next to the team name and skips any that are missing.

Current set: all 24 2026-27 Championship clubs, pulled from ESPN's team list
(`site.api.espn.com/apis/site/v2/sports/soccer/eng.2/teams`, logos on
`a.espncdn.com`) and resized to 256px. Re-run that for new seasons to pick up
promoted/relegated clubs.

`derby-county.svg` is the ram head from dcfc.co.uk (fills stripped so it
renders black). `cover_image.js` prefers an `.svg` over the `.png`.
