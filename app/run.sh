#!/bin/sh
# MARK: build once, serve on :3900. Use `npm run dev` inside app/ while developing.
cd "$(dirname "$0")"
[ -d node_modules ] || npm install
npm run build && npm run start
