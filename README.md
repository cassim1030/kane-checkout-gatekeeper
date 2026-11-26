# Checkout Gatekeeper

A tiny, self-contained web shop that **refuses to ship until Kane CLI signs off**.

Built for the [KaneCLI Online Hackathon](https://kaneclihack.sh) (12–19 Nov 2026,
deadline extended to 26 Nov 23:59 IST / 27 Nov 02:29 Taipei). One agent builds it, Kane CLI
verifies it in a real browser, and the gate blocks shipping until Kane passes.

## Evidence: two closed loops, both PASSED

| Flow | Deliberate bug | Kane FAIL | Fix | Kane PASS | Report |
|---|---|---|---|---|---|
| Checkout total | Review total was cart − $10 ($29.98 vs $39.98) | Run 1, session `ccef0388`, 149 s, confirmed, confidence 0.98 | `getReviewTotal()` returns the full cart total (one line) | Re-run 26 Nov 2026, session `a7fb42d1`, 167 s, all sections passed | [report](https://test-manager.lambdatest.com/projects/01M7M0T8T63E9DTR505934KKPX/test-cases/01M7M0X46K2JJNDAZ5GW0HX5Q0/dashboard/share/US_6QHVETJ83FAHCSF1NYDE64F11V56W8VF83KD5SA81LM71CQ5V9O7JVYRNJKFNXAI?type=summary&agentView=true&fqdn=summary-page) |
| Discount SAVE10 | Review ignored the discount, charged full $39.98 | Session `f2c2e590`, 212 s, confirmed, confidence 0.99 | Review shows the discounted total (one line) | Re-run 26 Nov 2026, sessions `a7fb42d1` (checkout, 167 s) + `baee1dfd` (discount, 199 s, review $35.98) | [report](https://test-manager.lambdatest.com/projects/01M7M0T8T63E9DTR505934KKPX/test-cases/01M7SQ3B0T46G0F4FWKP346Q9K/dashboard/share/US_ARFYD846H2P1F34EC9EFXK8TSQMV4U42ZHD8IE7CSKI7X7ATPYUBYAIGP935YNRW?type=summary&agentView=true&fqdn=summary-page) |

Honest note: on flow 1 Kane guessed the cause as "omits the notebook" while the code actually subtracted a flat $10 — the observable failure (review $29.98 vs cart $39.98) is identical, and `BUG.md` says so. The gate exits 0 only when `kane-cli` exits 0 **and** its output contains PASSED; nothing is faked.

## Status: two closed loops complete — Kane PASSED both flows

v1 had one deliberate, real bug (see `BUG.md`): the review step showed a total
$10.00 lower than the cart total. Kane caught it in its first real run
(review $29.98 vs cart $39.98, verdict confirmed, confidence 0.98), the fix
landed, and the gate now prints `PASSED — Kane signed off. SHIP.`
(see `kane/output-checkout/Result.md` and the
[Kane run report](https://test-manager.lambdatest.com/projects/01M7M0T8T63E9DTR505934KKPX/test-cases/01M7M0X46K2JJNDAZ5GW0HX5Q0/dashboard/share/US_6QHVETJ83FAHCSF1NYDE64F11V56W8VF83KD5SA81LM71CQ5V9O7JVYRNJKFNXAI?type=summary&agentView=true&fqdn=summary-page)).

v2 (19 Nov 2026) added a second verified flow: discount code `SAVE10` (10% off,
$39.98 → $35.98). The same story repeated — first the review step ignored the
discount and charged the full $39.98, Kane caught it ("Review total ignores
applied discount", confidence 0.99,
[report](https://test-manager.lambdatest.com/projects/01M7M0T8T63E9DTR505934KKPX/test-cases/01M7SQ3B0T46G0F4FWKP346Q9K/dashboard/share/US_0Q0NZSA6SOBC3T16BIAQLWR5N398OKMI4ZZ8G6KQL3FGUGWNAQTQV8S8RGSUOIMT?type=summary&agentView=true&fqdn=summary-page)),
then the fix landed and the gate runs both flows to PASSED. Details in `BUG.md`.

## What it is

- A single-page static shop: plain HTML/CSS/JS, no build step, no backend,
  no paid services, no secrets.
- 3 products: Kane Tote Bag $19.99, Gatekeeper Mug $29.99, Ship-It Notebook $9.99.
- Add to cart, cart total, discount code (SAVE10 = 10% off), guest checkout
  with an email field, a review step showing the entered email, the applied
  discount and the total, then an order confirmation with an order number.
- Two Kane test flows (`kane/checkout_test.md`, `kane/discount_test.md`) and a
  ship gate (`gate.sh`, `gate.mjs`) that runs both and exits non-zero and
  prints BLOCKED when Kane fails either.

## How to run locally

```bash
cd kane-checkout-gatekeeper
python3 -m http.server 8000
```

Then open http://localhost:8000/

Try the flow by hand: add the Mug ($29.99) and the Notebook ($9.99) —
cart total $39.98 — go to checkout as guest `guest@shop.test`, continue to
review. The email is right and the review total now matches the cart
($39.98). The original v1 bug — review showed $29.98 — is documented in
`BUG.md`, along with Kane's verdict and the fix.

## The Kane flow

`kane/checkout_test.md` (the exact flow):

> Check out without signing in. Verify the email and the total.

Run it (shop must be running on http://localhost:8000, Kane CLI installed
and authenticated — see "Still missing" below):

```bash
npm install -g @testmuai/kane-cli
kane-cli testmd run kane/checkout_test.md
# or, through the gate:
./gate.sh
```

v1 failed exactly there (see `BUG.md` for Kane's verdict); after the fix
the gate passes.

## The closed loop (Kane → fix → re-run)

1. **Build** (done in v1): agent builds the shop with a real bug in it.
2. **Verify**: Kane runs the plain-English checkout flow in a real browser
   and returns pass/fail with evidence. v1 must FAIL.
3. **Fix**: the agent reads Kane's evidence and fixes only the bug
   (`getReviewTotal()` in `app.js` — drop the $10 subtraction).
4. **Re-run**: `./gate.sh` must print `PASSED — Kane signed off. SHIP.`
   before the project is submitted. No pass, no ship.

The gate never fakes a result: if `kane-cli` is missing it prints
"Kane not available" and exits 2 — not a pass.

## Files

| File | What it is |
|---|---|
| `index.html` | The shop: products, cart, checkout, review, confirmation |
| `app.js` | Cart math + UI; the bug is in `getReviewTotal()` |
| `style.css` | Minimal styling |
| `kane/checkout_test.md` | Plain-English Kane test flow (original checkout) + how to run it |
| `kane/discount_test.md` | Plain-English Kane test flow (SAVE10 discount) + how to run it |
| `gate.sh` | Ship gate (bash): runs Kane on both flows, BLOCKED on fail, SHIP on pass |
| `gate.mjs` | Same gate in Node |
| `BUG.md` | The deliberate bugs (v1 + v2), where they live, how Kane caught them |

## Still missing (not done in this build)

- [x] Register on TestMu AI and claim the 10,000 free credits (done 17 Nov
  2026 via GitHub login; balance 11,200 at login).
- [x] Install + authenticate Kane CLI, run `./gate.sh`, keep the FAIL evidence.
- [x] Fix the bug from Kane's evidence, re-run the gate until it PASSES
  (passed 17 Nov 2026, session `1d79a092`).
- [x] Push to a public GitHub repo (repo must be initialised on/after 12 Nov 2026) — done 17 Nov 2026: https://github.com/cassim1030/kane-checkout-gatekeeper (Public).
- [x] Record a 3–5 min YouTube demo video (show the Kane fail, the fix, the pass) — done 17 Nov 2026: https://youtu.be/a5Ssuc5-gGM
- [x] At least 2 public posts about the project (X / Hacker News / Reddit / LinkedIn) — 6 posts @alldead0002 (3 on 17 Nov, 3 on 19 Nov 2026).
- [x] Submit before the deadline via https://www.kaneclihack.sh/o/submit — submitted 17 Nov 2026, receipt KH-Y4SZQT; deadline extended to 26 Nov 23:59 IST.
- [x] Second verified flow (discount code SAVE10) — built 19 Nov 2026, Kane caught the bug ("Review total ignores applied discount", 0.99), fix landed, gate re-ran to PASSED on both flows (sessions `b9a7c7b0` checkout, `4c3224dd` discount); GitHub upload done (11 files) and submission description updated the same day (receipt KH-Y4SZQT, "Agent used" still Muse).
