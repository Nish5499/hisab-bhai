# Testing & Verification Guide — HisabBhai

This document covers running automated unit tests, component tests, and smoke test checklists for HisabBhai.

---

## 1. Running Automated Tests

HisabBhai uses **Vitest** and **React Testing Library** for fast, deterministic testing.

### Run Unit & Component Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npx vitest
```

### Run with Coverage
```bash
npx vitest run --coverage
```

---

## 2. Test Suites Overview

### A. Money Calculations & Currency Formatting (`src/lib/money/calculations.test.ts`)
- **Indian Numbering Formatting (`formatInr`):** Verifies standard Indian numbering formatting (e.g. ₹1,500.00 and ₹1,50,000.00).
- **Zero Paise Leakage:** Confirms splitting ₹100 among 3 participants yields 3,334 + 3,333 + 3,333 = 10,000 paise exactly without floating-point errors.
- **Participant Exclusion:** Confirms excluded participants receive strictly 0 paise liability.
- **Percentages & Shares Ratio:** Tests mathematical proportional allocation with remainder ranking.
- **Group Balances & Settlements:** Verifies net balance calculation after expenses and partial settlement reconciliation.
- **Greedy Debt Simplification:** Tests debtor-creditor matching algorithm.

### B. Money Flow Visualizer Component (`src/components/money/MoneyFlowVisualizer.test.tsx`)
- Validates rendering of payer nodes and total expense badges.
- Confirms explicit callout of excluded participants with ₹0 liability and "Not Included" tags.

---

## 3. End-to-End Manual Smoke Test Checklist

Execute these 14 manual checks before releasing to production:

| # | Test Scenario | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| 1 | **Demo Mode Launch** | Visit `/` -> Click "Instant Demo Mode". | User lands on dashboard with Rahul Sharma as active persona and Flat 402 data pre-loaded. |
| 2 | **Persona Switching** | Click "Actor: Rahul" in header -> Select "Priya Patel". | Dashboard immediately updates to show Priya's personal balance view. |
| 3 | **Group Overview** | Navigate to `/groups` -> Open "Flat 402 Bantai". | View expenses list, member balances, and simplified transfer breakdown. |
| 4 | **Add Expense (Equal)** | Click "Add Expense" -> ₹1,200 for "Groceries" -> Split Equally. | Live preview shows ₹300 per member. |
| 5 | **Exclude Member** | In Add Expense -> Tap "Exclude" on Neha Singh. | Neha's share becomes ₹0; remaining 3 members split ₹400 each. |
| 6 | **Animated Paisa Flow** | Open an expense details page. | Payer node animates into view, followed by participant shares and excluded tags. |
| 7 | **Debt Simplification** | Go to `/balances`. | Shows minimal greedy transfers needed to clear group debts. |
| 8 | **Record Settlement** | Tap "Settle This" on a suggested transfer -> Enter amount -> Confirm. | Confetti triggers, status updates to "Scene Sorted! 🎉", and balances recalculate. |
| 9 | **Create New Group** | Go to `/groups/new` -> Enter "Goa Trip" -> Pick 🏖️ emoji. | Group is created with creator as owner and members assigned. |
| 10 | **Invite Link Sharing** | In Group detail -> Tap "Invite Link". | Copies `/join/<groupId>` to clipboard. |
| 11 | **Join Group Flow** | Open `/join/<groupId>` in a new tab. | Shows group invite confirmation and allows joining. |
| 12 | **Profile UPI Setup** | Go to `/profile` -> Enter UPI ID `rahul@upi` -> Save. | UPI ID is saved and appears on settlement transfer cards. |
| 13 | **Google OAuth Login** | On `/login` -> Click "Continue with Google". | Redirects to Google, authenticates, and redirects back to `/dashboard`. |
| 14 | **Email Signup** | On `/signup` -> Submit new email/password. | Displays "Check Your Email" confirmation screen. |
