-- Fixtures we poll around. id is the match date in UK time (YYYY-MM-DD).
CREATE TABLE IF NOT EXISTS fixtures (
  id            TEXT PRIMARY KEY,
  kickoff_ms    INTEGER NOT NULL,      -- kick-off, epoch ms (UTC)
  kickoff_iso   TEXT NOT NULL,         -- as supplied, with UK offset
  opponent      TEXT NOT NULL,
  home          INTEGER NOT NULL DEFAULT 1,
  competition   TEXT,
  last_poll_ms  INTEGER,
  refreshed_ms  INTEGER                -- set once post-match counts are refreshed
);

CREATE TABLE IF NOT EXISTS posts (
  uri           TEXT PRIMARY KEY,
  cid           TEXT,
  fixture_id    TEXT REFERENCES fixtures(id),
  author_did    TEXT NOT NULL,
  author_handle TEXT NOT NULL,
  author_name   TEXT,
  text          TEXT NOT NULL DEFAULT '',
  created_ms    INTEGER NOT NULL,
  indexed_ms    INTEGER,
  reply_parent  TEXT,
  reply_root    TEXT,
  quote_uri     TEXT,
  external_url  TEXT,
  media         TEXT,                  -- images / video / null
  image_alts    TEXT,
  like_count    INTEGER DEFAULT 0,
  repost_count  INTEGER DEFAULT 0,
  reply_count   INTEGER DEFAULT 0,
  quote_count   INTEGER DEFAULT 0,
  fetched_ms    INTEGER NOT NULL,
  updated_ms    INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS posts_fixture_created ON posts (fixture_id, created_ms);
