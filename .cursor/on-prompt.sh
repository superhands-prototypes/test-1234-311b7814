#!/bin/bash
# Capture prompt from Cursor agent - pass through to menubar
INPUT=$(cat)
curl -s -X POST "http://127.0.0.1:43821/cursor-prompt" \
  -H "Content-Type: application/json" \
  -d "$INPUT" > /dev/null 2>&1 || true
# Always allow the prompt to proceed
echo '{"permission":"allow"}'

