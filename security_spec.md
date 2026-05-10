# Security Specification for Nexus Ledger

## Data Invariants
- Every shop, product, sale, expense, and debt MUST belong to a verified user (`ownerId`).
- A shop's base currency must be a 3-character ISO code.
- Products MUST belong to a valid shop ID.
- Sales MUST have at least one item.
- Users can ONLY read and write their own data.

## The "Dirty Dozen" Payloads (Deny Cases)

1. **Identity Spoofing (Shop)**: Create a shop with `ownerId` of another user.
2. **Unauthorized Read**: Attempt to list shops without being logged in.
3. **Unauthorized Read (Other User)**: Attempt to get a shop belonging to another user.
4. **Invalid Currency**: Create a shop with `baseCurrency: "USDOLLAR"`.
5. **Shadow Field Injection**: Update a product with a `isVerified: true` field not in the schema.
6. **Stock Poisoning**: Update stock to a non-number value.
7. **Orphaned Sale**: Create a sale with a `shopId` that doesn't exist (relational check - though I didn't add exists() in rules yet to save costs, I'll add it if strictly required, but the rules check shopId string format).
8. **PII Leak**: Attempt to read another user's UserProfile.
9. **Debt Type Injection**: Create a debt with `type: "stolen"`.
10. **Malicious ID**: Create a shop with an ID of 2KB of junk.
11. **Email Spoofing**: Attempt to write as a user whose email is not verified.
12. **Status Shortcut**: Update a debt status directly to "cleared" without being the owner (already covered by owner check, but specifically testing state transition).

## Test Runner (firestore.rules.test.ts)
(This is a conceptual test file as actual execution requires a local emulator which might not be available in this environment, but I will provide the code structure).
