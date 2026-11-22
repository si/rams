# Club crests

One PNG per club, named by slug of the team name as it appears in the
standings rows (lowercase, non-alphanumerics to hyphens):

- `derby-county.png`, `southampton.png`, `burnley.png`, `watford.png`,
  `lincoln-city.png`, `preston-north-end.png`, ...

Transparent background preferred. `standings_image.py` draws each one as a
small round avatar next to the team name and skips any that are missing.
