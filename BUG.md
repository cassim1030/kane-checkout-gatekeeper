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
