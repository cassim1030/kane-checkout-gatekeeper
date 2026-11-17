---
test: ../checkout_test.md
status: passed
started: 2026-11-17T06:11:24.023Z
duration_s: 272
session_id: 1d79a092-ed61-4be8-89e1-d56116d1dbff
---

# Kane CLI test — Checkout Gatekeeper — Result

## Flow ✓ passed (5.36s)
md5: 35d8d85240e78a04bcb7fae358de11d3
Start at http://localhost:8000/

Check out without signing in. Verify the email and the total.

## Steps, in plain English ✓ passed (110.5s)
md5: 50105804d09f4f22d897af489236ef92
1. Open the shop at http://localhost:8000/
2. Add the Gatekeeper Mug ($29.99) to the cart.
3. Add the Ship-It Notebook ($9.99) to the cart.
4. Check that the cart total is $39.98.
5. Go to checkout.
6. Check out as a guest with the email guest@shop.test (do not sign in).
7. Continue to review.
8. Verify the email shown on the review step is guest@shop.test.
9. Verify the total shown on the review step matches the cart total of $39.98.
10. Place the order and verify an order number is shown on the confirmation page. Stay on that page; do not navigate anywhere else.

## Expected result ✓ passed (12.9s)
md5: 96beedc3b05e0e4c06e3d0c4266b5346
The run passes only if every step above succeeds. (This section used to
spell out the pass conditions, but Kane evaluates it as a separate step that
navigates away from the shop to an external page this environment cannot
reach, so the pass conditions now live only in the steps themselves.)

## How to run ✓ passed (83.1s)
md5: ce76bbb389b23dc778f36320de86dc74
```bash
# from the repo root, with the shop running on http://localhost:8000
kane-cli testmd run kane/checkout_test.md
```

Equivalent one-liner (same flow, no saved file):

```bash
kane-cli run "Check out without signing in. Verify the email and the total."
```

Or use the gate (blocks shipping on failure):

```bash
./gate.sh
```
