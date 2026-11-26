---
test: ../checkout_test.md
status: passed
started: 2026-11-26T06:51:53.051Z
duration_s: 167
session_id: a7fb42d1-3e27-4300-be3d-b1d8651bf988
---

# Kane CLI test — Checkout Gatekeeper — Result

## Flow ✓ passed (5.46s)
md5: 35d8d85240e78a04bcb7fae358de11d3
Start at http://localhost:8000/

Check out without signing in. Verify the email and the total.

## Steps, in plain English ✓ passed (98.5s)
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

## Expected result ✓ passed (13.2s)
md5: 96beedc3b05e0e4c06e3d0c4266b5346
The run passes only if every step above succeeds. (This section used to
spell out the pass conditions, but Kane evaluates it as a separate step that
navigates away from the shop to an external page this environment cannot
reach, so the pass conditions now live only in the steps themselves.)
