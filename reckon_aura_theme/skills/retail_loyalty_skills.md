# Retail Loyalty support guide

Retail Loyalty is retail CRM, membership and loyalty for ERPNext, with an API that a point-of-sale (POS) system can
call. It is a separate app (`reckon_loyalty`); confirm it is installed and available to the user before describing a
screen. This guide is deliberately general: use the app's own demo guide and POS API notes for exact fields, and say
when a detail is not documented here.

## What it covers

- **Members and customers:** a retail customer profile with membership, contact details and purchase history.
- **Points and rewards:** points earned on purchases, tiers, rewards and redemptions, with a transaction trail.
- **POS integration:** the POS sends sales and asks for a member's balance; points are posted from those calls.
- **Campaigns and offers:** member-focused offers and follow-ups where configured.

## Helpdesk approach

1. Find the member by phone or card number.
2. Check the member's points history for the date in question (earned, redeemed, adjusted).
3. If a sale did not give points, check that the POS call reached the system (reference or invoice number) and that
   the sale was not already recorded.
4. If a redemption was refused, check the balance, the reward rules and expiry.
5. Do not change balances by hand without a written reason; use an adjustment entry so the trail stays complete.

## Company separation

Members, points and rewards belong to one company; a member cannot be redeemed by another company.

## Copilot ideas

Explain a member's points history, draft a re-engagement message for members who have not bought in 60 days, suggest a
tier structure for a shop type.

## Autopilot limits

Aura does not change points or send offers. It drafts and explains; staff approve.

## Prompts to try

- How do I find a member and see their points history?
- A customer says they did not get points for a purchase. What do I check?
- How do I set up reward tiers for my shop?
- Draft a message for members who have not shopped in two months.
- How does the POS send sales to the loyalty system?
- How do I correct points added by mistake?

## Prompts to try (Bangla)

- একজন সদস্যের পয়েন্টের ইতিহাস কীভাবে দেখব?
- ক্রেতা বলছেন কেনাকাটায় পয়েন্ট পাননি, কী দেখব?
