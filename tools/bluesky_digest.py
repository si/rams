#!/usr/bin/env python3
"""Client for the SuperRams fan-feed Worker (see worker/README.md).

Env:
    FAN_FEED_URL    the Worker's URL, e.g. https://superrams-fan-feed.<account>.workers.dev
    FAN_FEED_TOKEN  the Worker's READ_TOKEN. Optional in cloud sessions if a proxy
                    secret injects it for the Worker's host.

Usage:
    bluesky_digest.py match 2026-11-28                  # Markdown digest to stdout
    bluesky_digest.py match 2026-11-28 --json --out f   # JSON to a file
    bluesky_digest.py fixtures
    bluesky_digest.py add --kickoff 2026-11-28T15:00:00+00:00 --opponent "Hull City" [--away] [--competition "EFL Championship"]
    bluesky_digest.py remove 2026-11-28
    bluesky_digest.py poll [--fixture 2026-11-28]       # poll now, ignoring the window
    bluesky_digest.py refresh --fixture 2026-11-28      # refresh engagement counts now
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request


def call(method, path, body=None):
    base = os.environ.get("FAN_FEED_URL", "").rstrip("/")
    if not base:
        sys.exit("Set FAN_FEED_URL to the Worker's URL")
    headers = {"Accept": "application/json, text/markdown"}
    token = os.environ.get("FAN_FEED_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = None
    if body is not None:
        data = json.dumps(body).encode()
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(base + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return resp.read().decode()
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code}: {e.read().decode()[:500]}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)

    m = sub.add_parser("match", help="fetch a match digest")
    m.add_argument("fixture", help="fixture id (UK match date, YYYY-MM-DD)")
    m.add_argument("--json", action="store_true")
    m.add_argument("--out")

    sub.add_parser("fixtures", help="list fixtures")

    a = sub.add_parser("add", help="add or update a fixture")
    a.add_argument("--kickoff", required=True, help="ISO 8601 with UK offset, e.g. 2026-11-28T15:00:00+00:00")
    a.add_argument("--opponent", required=True)
    a.add_argument("--away", action="store_true")
    a.add_argument("--competition")
    a.add_argument("--id", help="defaults to the UK match date")

    r = sub.add_parser("remove", help="delete a fixture and its posts")
    r.add_argument("fixture")

    for name in ("poll", "refresh"):
        p = sub.add_parser(name)
        p.add_argument("--fixture", required=(name == "refresh"))

    args = ap.parse_args()

    if args.cmd == "match":
        out = call("GET", f"/match/{args.fixture}" + ("?format=json" if args.json else ""))
        if args.out:
            with open(args.out, "w") as f:
                f.write(out)
            print(f"Wrote {args.out}")
        else:
            print(out)
    elif args.cmd == "fixtures":
        print(call("GET", "/fixtures"))
    elif args.cmd == "add":
        fx = {"kickoff": args.kickoff, "opponent": args.opponent, "home": not args.away}
        if args.competition:
            fx["competition"] = args.competition
        if args.id:
            fx["id"] = args.id
        print(call("POST", "/fixtures", [fx]))
    elif args.cmd == "remove":
        print(call("DELETE", f"/fixtures/{args.fixture}"))
    else:
        q = f"?fixture={args.fixture}" if args.fixture else ""
        print(call("POST", f"/{args.cmd}{q}"))


if __name__ == "__main__":
    main()
