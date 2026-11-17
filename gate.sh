#!/usr/bin/env bash
# Checkout Gatekeeper — the ship gate.
# Runs Kane CLI against the local shop and blocks shipping on failure.
# It NEVER fakes a result: no kane-cli, no pass. Unknown output, no pass.
set -u

SHOP_URL="${SHOP_URL:-http://localhost:8000}"
FLOW_FILE="kane/checkout_test.md"

# httpx (used by Kane's runner) cannot parse bracketed IPv6 entries such as
# *[::1] in no_proxy ("Invalid port: ':1]'"), so keep only plain localhost
# entries for the Kane run. The shop itself runs on localhost.
export no_proxy="localhost,127.0.0.1"
export NO_PROXY="localhost,127.0.0.1"

if ! command -v kane-cli >/dev/null 2>&1; then
  echo "Kane not available: kane-cli is not installed or not on PATH."
  echo "Install it first: npm install -g @testmuai/kane-cli"
  echo "Then start the shop (see README.md) and run ./gate.sh again."
  exit 2
fi

if [ ! -f "$FLOW_FILE" ]; then
  echo "BLOCKED: test flow file $FLOW_FILE not found."
  exit 2
fi

echo "Gate: running Kane CLI against $SHOP_URL ..."
echo "Flow: $FLOW_FILE"

OUTPUT="$(kane-cli testmd run --headless --url "$SHOP_URL" "$FLOW_FILE" 2>&1)"
STATUS=$?
echo "$OUTPUT"

# Kane's own exit code is the primary signal; the word PASSED is secondary.
if [ "$STATUS" -eq 0 ] && echo "$OUTPUT" | grep -qi "PASSED"; then
  echo "PASSED — Kane signed off. SHIP."
  exit 0
fi

if echo "$OUTPUT" | grep -qiE "FAILED|FAIL"; then
  echo "BLOCKED — Kane failed the checkout flow. Do not ship. Fix, then re-run ./gate.sh."
  exit 1
fi

if [ "$STATUS" -ne 0 ]; then
  echo "BLOCKED — kane-cli exited with status $STATUS. Do not ship."
  exit 1
fi

echo "BLOCKED — Kane result could not be determined from its output. Do not ship."
exit 3
