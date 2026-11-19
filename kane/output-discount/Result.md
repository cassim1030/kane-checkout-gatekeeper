---
test: ../discount_test.md
status: passed
started: 2026-11-19T11:10:07.006Z
duration_s: 201
session_id: 4c3224dd-b931-4973-a909-396dcc7d87c7
---

# Kane CLI test — Checkout Gatekeeper, discount-code flow — Result

## Flow ✓ passed (8.61s)
md5: 4c303cf7db7e976e0e432ce2073e8a3a
Start at http://localhost:8000/

Apply the SAVE10 discount code (10% off) and check out. The review page
must show the discounted total, not the full cart total.

## Steps, in plain English ✓ passed (139.1s)
md5: a68d0b4fa9f373e3d60b1399f321cbaa
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

## Expected result ✓ passed (12.7s)
md5: 07dfa0c289468f57a8b4fc1216813611
The run passes only if every step above succeeds. (The pass conditions live
only in the steps themselves — see kane/checkout_test.md for why.)
