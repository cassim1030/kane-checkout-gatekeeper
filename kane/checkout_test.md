# Kane CLI test — Checkout Gatekeeper

Plain-English end-to-end flow for Kane CLI. Run it against the local shop
(see README.md for how to start the server first).

## Flow

Start at http://localhost:8000/

Check out without signing in. Verify the email and the total.

## Steps, in plain English

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

## Expected result

The run passes only if every step above succeeds. (This section used to
spell out the pass conditions, but Kane evaluates it as a separate step that
navigates away from the shop to an external page this environment cannot
reach, so the pass conditions now live only in the steps themselves.)

## How to run

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
