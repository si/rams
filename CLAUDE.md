# SuperRams repo notes

## Scheduling posts on Buffer

New social posts can be scheduled straight from Claude using `tools/buffer.py`
(see `tools/README.md` for auth, channel IDs and flags).

Whenever you draft social posts (matchday socials or any other X/Bluesky copy):

1. Show the draft copy in chat as usual.
2. Ask Si whether he wants each post **scheduled for a specific time** or
   **posted straight away**. Don't assume, and don't post before he answers
   and the final text is agreed.
3. Based on his answer, send it to Buffer:
   - specific time: `--due-at <ISO 8601 with UK offset>` (`+00:00` GMT,
     `+01:00` BST; clocks change last Sunday of March and October)
   - straight away: `--now`
   - if he just says "queue it", omit both and it goes on the Buffer queue
4. Run with `--dry-run` first if anything about the channel or time is unclear,
   then report back the post ID, channel and due time.

Only X and Bluesky are connected. Facebook copy (and Patreon posts) still need
posting manually, so say so rather than silently skipping them.
