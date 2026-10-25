# tools

## buffer.py

Posts to Buffer via its GraphQL API using a per-brand personal access key, kept
separate from any OAuth Buffer connector.

Keys live in the cloud environment settings (never in the repo):

| Brand | Env var |
|---|---|
| superrams | `BUFFER_API_KEY_SUPERRAMS` |
| housefinesse | `BUFFER_API_KEY_HOUSEFINESSE` |
| petals | `BUFFER_API_KEY_PETALS` |

```
python3 tools/buffer.py superrams account
python3 tools/buffer.py superrams channels --org ORG_ID
python3 tools/buffer.py superrams post --channel CHANNEL_ID --text "COYR" --dry-run
```
