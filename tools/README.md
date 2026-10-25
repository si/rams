# tools

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
```

`--due-at` needs the UK offset: `+00:00` in winter (GMT), `+01:00` in summer (BST).

### SuperRams IDs

| Item | ID |
|---|---|
| Organisation (Super Rams) | `6a800dcea10846fbbd0a34cc` |
| X: `derbycounty` | `6a8855a1ccaf649a67ebbd7d` |
| Bluesky: Derby County | `6a802be6b2d9d57743808545` |

There's no Facebook channel connected in Buffer, so Facebook copy still needs
posting by hand.
