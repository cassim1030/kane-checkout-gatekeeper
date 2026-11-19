#!/usr/bin/env bash
# Checkout Gatekeeper — the ship gate.
# Runs Kane CLI against the local shop (both flows) and blocks shipping on failure.
# It NEVER fakes a result: no kane-cli, no pass. Unknown output, no pass.
set -u

SHOP_URL="${SHOP_URL:-http://localhost:8000}"
FLOW_FILES=("kane/checkout_test.md" "kane/discount_test.md")

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

for FLOW_FILE in "${FLOW_FILES[@]}"; do
  if [ ! -f "$FLOW_FILE" ]; then
    echo "BLOCKED: test flow file $FLOW_FILE not found."
    exit 2
  fi
done

OVERALL=0
for FLOW_FILE in "${FLOW_FILES[@]}"; do
  echo "Gate: running Kane CLI against $SHOP_URL ..."
  echo "Flow: $FLOW_FILE"

  OUTPUT="$(KANE_CLI_CHROME_PATH="${KANE_CLI_CHROME_PATH:-$HOME/.local/bin/chrome-nosandbox}" kane-cli testmd run --headless --url "$SHOP_URL" "$FLOW_FILE" 2>&1)"
  STATUS=$?
  echo "$OUTPUT"

  # Kane's own exit code is the primary signal; the word PASSED is secondary.
  if [ "$STATUS" -eq 0 ] && echo "$OUTPUT" | grep -qi "PASSED"; then
    echo "PASSED — Kane signed off on $FLOW_FILE. SHIP."
    continue
  fi

  OVERALL=1
  if echo "$OUTPUT" | grep -qiE "FAILED|FAIL"; then
    echo "BLOCKED — Kane failed the flow in $FLOW_FILE. Do not ship. Fix, then re-run ./gate.sh."
  elif [ "$STATUS" -ne 0 ]; then
    echo "BLOCKED — kane-cli exited with status $STATUS for $FLOW_FILE. Do not ship."
  else
    echo "BLOCKED — Kane result could not be determined from its output for $FLOW_FILE. Do not ship."
  fi
done

if [ "$OVERALL" -eq 0 ]; then
  echo "PASSED — Kane signed off on all flows. SHIP."
  exit 0
fi
exit 1
