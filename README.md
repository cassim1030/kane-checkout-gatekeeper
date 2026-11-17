# Checkout Gatekeeper

A tiny, self-contained web shop that **refuses to ship until Kane CLI signs off**.

Built for the [KaneCLI Online Hackathon](https://kaneclihack.sh) (12–19 Nov 2026,
deadline 19 Nov 23:59 IST / 20 Nov 02:29 Taipei). One agent builds it, Kane CLI
verifies it in a real browser, and the gate blocks shipping until Kane passes.

## Status: closed loop complete — Kane PASSED, ready to ship

v1 had one deliberate, real bug (see `BUG.md`): the review step showed a total
$10.00 lower than the cart total. Kane caught it in its first real run
(review $29.98 vs cart $39.98, verdict confirmed, confidence 0.98), the fix
landed, and the gate now prints `PASSED — Kane signed off. SHIP.`
(see `kane/output-checkout/Result.md` and the
[Kane run report](https://test-manager.lambdatest.com/projects/01M7M0T8T63E9DTR505934KKPX/test-cases/01M7M0X46K2JJNDAZ5GW0HX5Q0/dashboard/share/US_98G0SV600PP9LCL0LW4D0AEVKFZPE1EUBN855NPTNQW65TR40G1FZAEVFQO0ZIQI?type=summary&agentView=true&fqdn=summary-page)).

## What it is

- A single-page static shop: plain HTML/CSS/JS, no build step, no backend,
  no paid services, no secrets.
- 3 products: Kane Tote Bag $19.99, Gatekeeper Mug $29.99, Ship-It Notebook $9.99.
- Add to cart, cart total, guest checkout with an email field, a review step
  showing the entered email and the total, then an order confirmation with an
  order number.
- A Kane test flow (`kane/checkout_test.md`) and a ship gate (`gate.sh`, `gate.mjs`)
  that exit non-zero and print BLOCKED when Kane fails.

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
| `kane/checkout_test.md` | Plain-English Kane test flow + how to run it |
| `gate.sh` | Ship gate (bash): runs Kane, BLOCKED on fail, SHIP on pass |
| `gate.mjs` | Same gate in Node |
| `BUG.md` | The deliberate v1 bug, where it lives, how Kane catches it |

## Still missing (not done in this build)

- [x] Register on TestMu AI and claim the 10,000 free credits (done 17 Nov
  2026 via GitHub login, alldead01@gmail.com; balance 11,200 at login).
- [x] Install + authenticate Kane CLI, run `./gate.sh`, keep the FAIL evidence.
- [x] Fix the bug from Kane's evidence, re-run the gate until it PASSES
  (passed 17 Nov 2026, session `1d79a092`).
- [x] Push to a public GitHub repo (repo must be initialised on/after 12 Nov 2026) — done 17 Nov 2026: https://github.com/cassim1030/kane-checkout-gatekeeper (created today, Public, 3 commits).
- [ ] Record a 3–5 min YouTube demo video (show the Kane fail, the fix, the pass).
- [ ] At least 2 public posts about the project (X / Hacker News / Reddit / LinkedIn).
- [ ] Submit before 19 Nov 23:59 IST via https://www.kaneclihack.sh/o/submit
