# Kane CLI test — Checkout Gatekeeper, discount-code flow

Plain-English end-to-end flow for Kane CLI. Run it against the local shop
(see README.md for how to start the server first).

## Flow

Start at http://localhost:8000/

Apply the SAVE10 discount code (10% off) and check out. The review page
must show the discounted total, not the full cart total.

## Steps, in plain English

1. Open the shop at http://localhost:8000/
2. Add the Gatekeeper Mug ($29.99) to the cart.
3. Add the Ship-It Notebook ($9.99) to the cart.
4. Check that the cart total is $39.98.
5. Enter the discount code SAVE10 in the discount code field and click Apply discount.
6. Check that the discounted total shown is $35.98.
7. Go to checkout.
8. Check that the cart total shown on the checkout step is $35.98.
9. Check out as a guest with the email guest@shop.test (do not sign in).
10. Continue to review.
11. Verify the email shown on the review step is guest@shop.test.
12. Verify the discount SAVE10 (10% off) is shown on the review step.
13. Verify the total to charge shown on the review step is $35.98 — the discounted total, not the full $39.98 cart total.
14. Place the order and verify an order number is shown on the confirmation page, and that the total charged is $35.98. Stay on that page; do not navigate anywhere else.

## Expected result

The run passes only if every step above succeeds. (The pass conditions live
only in the steps themselves — see kane/checkout_test.md for why.)
