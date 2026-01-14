#!/bin/bash
# Cursor agent stopped - trigger commit via menubar
INPUT=$(cat)
curl -s -X POST "http://127.0.0.1:43821/cursor-commit" \
  -H "Content-Type: application/json" \
  -d "$INPUT" > /dev/null 2>&1 || true

