# Known bug — v1 (deliberate, do NOT fix yet)

## The bug

The review step shows the WRONG total.

- Cart total is correct: e.g. Gatekeeper Mug ($29.99) + Ship-It Notebook ($9.99)
  = **$39.98** in the cart and on the checkout page.
- Review step shows **$29.98** — exactly $10.00 less — as the "Total to charge".
- The order confirmation then charges that wrong review total.

The guest email is shown correctly on the review step; only the total is wrong.

## Where it lives

`app.js`, function `getReviewTotal()`:

```js
function getReviewTotal() {
  return Math.max(0, calculateCartTotal() - 10);
}
```

`calculateCartTotal()` itself is correct — the $10 subtraction happens only
when computing the review total. The review page (`index.html`, `#review-total`)
and the confirmation page (`#confirmation-total`) both display `getReviewTotal()`.

## How Kane should catch it

Flow in `kane/checkout_test.md`:

> Check out without signing in. Verify the email and the total.

Expected: FAIL at the review step, because the review total ($29.98) does not
match the cart total ($39.98). The email check should pass; the total check
must fail.

## Fix plan (after the Kane run, not now)

1. Run `./gate.sh` and keep the failing Kane evidence (screenshot / log / link).
2. Change `getReviewTotal()` to return `calculateCartTotal()` with no subtraction.
3. Re-run `./gate.sh` — it must print PASSED before anything ships.
4. Record the before/after evidence in the demo video and README.

## Caught by Kane CLI — 2026-11-17

- First real run (session `ccef0388-63b4-4c4d-935f-99bbb7e16ebb`, 149 s, about 57 credits): Kane added the Gatekeeper Mug and the Ship-It Notebook, verified the cart total $39.98, checked out as guest@shop.test, and failed at the review step — the review showed cart total $39.98 but total to charge $29.98.
- Bug verdict: "Review charge total omits Ship-It Notebook", application_issue / ui_data_defect, severity major, confidence 0.98. Evidence: `kane/output-checkout/Result.md` and the sealed evidence pack for session `ccef0388`.
- Note: Kane's root-cause guess (omits the notebook) is one reading of the same numbers; the actual code subtracted a flat $10. The observable failure is identical either way.
- Fix: `getReviewTotal()` now returns the full cart total. Re-run to follow.

## Closed loop complete — Kane PASSED, 2026-11-17

- Fifth gate run (session `1d79a092-ed61-4be8-89e1-d56116d1dbff`, 272 s): all four
  sections passed — Flow, Steps, Expected result, How to run. The gate printed
  `PASSED — Kane signed off. SHIP.` (exit 0). Evidence: `kane/output-checkout/Result.md`.
- The road here took five runs: run 1 caught the real bug; run 2 failed because
  the test file told Kane to fail at step 9 and it obeyed; runs 3–4 failed
  because the browser navigated to Kane's playground site, which this machine's
  Chrome cannot reach (curl reaches it fine through the same egress proxy — the
  cause is still unknown). Run 5 removed the separate Expected-result
  evaluation and pinned the start URL to the shop, and passed.
- Credits: balance 10,857.22 after the passing run (started at 11,200).

---

# v2 — discount code SAVE10 (added 2026-11-19)

## The feature and the bug

- New feature: a discount-code field in the cart. Entering `SAVE10` applies
  10% off: cart $39.98 → discounted total **$35.98** (discount −$4.00).
  The cart and checkout steps show the discounted total.
- Deliberate bug: `getReviewTotal()` returned the full cart total and
  ignored the discount, so the review step showed **$39.98** to charge
  even though SAVE10 was shown as applied and checkout showed $35.98.
- Flow: `kane/discount_test.md`. The gate (`gate.sh` / `gate.mjs`) now runs
  both flows — the original $39.98 checkout and the discount flow — and
  passes only when both pass.

## Caught by Kane CLI — 2026-11-19

- First discount run (session `f2c2e590-dec5-4b13-95dd-07ce0b5f3157`, run-1,
  212 s, ~51 credits): Kane added Mug + Notebook ($39.98), applied SAVE10
  (discounted total $35.98 verified), checked out as guest@shop.test, and
  failed at the review step — review showed SAVE10 applied but total to
  charge $39.98.
- Bug verdict: "Review total ignores applied discount", application_issue /
  ui_data_defect, severity major, confidence 0.99, result code 740
  (`assertion_error.confirmed_product_bug`). Evidence: session
  `f2c2e590-dec5-4b13-95dd-07ce0b5f3157`, evidence pack
  `f79e046f-03c7-48e6-b32d-15b62fba0b68`, report
  https://test-manager.lambdatest.com/projects/01M7M0T8T63E9DTR505934KKPX/test-cases/01M7SQ3B0T46G0F4FWKP346Q9K/dashboard/share/US_0Q0NZSA6SOBC3T16BIAQLWR5N398OKMI4ZZ8G6KQL3FGUGWNAQTQV8S8RGSUOIMT?type=summary&agentView=true&fqdn=summary-page
  (log: `kane/output-discount/run-buggy.log`).
- Fix: `getReviewTotal()` now returns `calculateDiscountedTotal()` — the
  discounted total when a code is applied, the cart total otherwise, so the
  original flow is unchanged. Re-run to follow.

## Closed loop complete — Kane PASSED both flows, 2026-11-19

- Gate re-run after the fix (`./gate.sh`, exit 0): both flows PASSED.
  - Original checkout flow: session `b9a7c7b0-54d7-4e42-b85e-8ab32d6bdeb4`,
    152 s, report
    https://test-manager.lambdatest.com/projects/01M7M0T8T63E9DTR505934KKPX/test-cases/01M7M0X46K2JJNDAZ5GW0HX5Q0/dashboard/share/US_SL73PS5NIZH3JJG9S0HOX77VYWY61LHVONHN6Y6ZUWMTFF5D5VPFA29RQAGCRZGK?type=summary&agentView=true&fqdn=summary-page
  - Discount flow: session `4c3224dd-b931-4973-a909-396dcc7d87c7`, 201 s,
    review total $35.98 and confirmation $35.98 verified, report
    https://test-manager.lambdatest.com/projects/01M7M0T8T63E9DTR505934KKPX/test-cases/01M7SQ3B0T46G0F4FWKP346Q9K/dashboard/share/US_WD8FTEY9YLEG5UFU0LJ6QUKS6IMTWU6OJRXLY2Z92PAWJGW49AHZOO3CEZVJXQK1?type=summary&agentView=true&fqdn=summary-page
- Detour on the way: the first fixed gate run failed the discount file, not
  the product — Kane treated the "How to run" code block as a flow and
  reported "Browser-only run cannot execute required Kane CLI command"
  (automation_bug/config_issue, 0.97, not a product bug). Fix: removed the
  "How to run" sections from both test files (same lesson as v1 run 3–4);
  how to run now lives only in README.md. The discount steps themselves had
  already passed in that run (145.3 s, review $35.98).
