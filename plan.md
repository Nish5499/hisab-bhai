# MASTER BUILD PROMPT — INDIAN EXPENSE-SPLITTING APP

## 1. Your Role

Act as a senior full-stack engineer, product designer, database architect, security engineer, and QA engineer.

Build a complete, production-oriented Indian expense-sharing application inspired by Splitwise, with a unique Indian personality and an animated Neo-Brutalism mobile-first interface.

Do not just describe the solution, generate mockups, or provide disconnected snippets. Create the actual application source code, database migrations, authentication implementation, tests, deployment configuration, and detailed setup documentation.

The result must be a functional application that real users can sign up for, log into, create groups, record expenses, see personalized balances, and settle debts securely.

Project name: **HisabBhai** (keep the name easy to change).

Tagline: **“Bhai, hisaab clear kar!”**

## 2. Core Product Vision

Build an intuitive expense-sharing application for Indian friends, roommates, families, couples, students, office colleagues, and travel groups.

The product should answer four questions immediately:

1. Who paid the money?
2. Who participated in the expense?
3. Who owes whom, and exactly how much?
4. Who has already paid, who still needs to pay, and who is excluded from this particular expense?

Every financial interaction must be understandable without opening a spreadsheet or manually calculating anything.

Use Indian rupees (₹), Indian number formatting, friendly Hinglish copy, and familiar scenarios such as chai, groceries, rent, electricity, Zomato orders, auto rides, UPI payments, cricket trips, and weekend outings.

The product must support English-first usability with optional Hinglish personality. Do not force slang into every label or make the interface difficult for non-Hindi speakers.

## 3. Required Technology Stack

Use the following technologies unless a genuine technical limitation requires an alternative.

- Frontend: React, TypeScript, and Vite.
- Styling: Tailwind CSS with a reusable Neo-Brutalism design system.
- UI components: Accessible, reusable components built with React.
- Animation: Framer Motion (Motion for React) for meaningful interface animations.
- Icons: Lucide React.
- Routing: React Router.
- Forms and validation: React Hook Form and Zod.
- Backend and database: Supabase PostgreSQL.
- Authentication: Supabase Auth with Google OAuth and email/password authentication.
- Data access: Supabase client with secure PostgreSQL Row Level Security (RLS).
- Hosting: Cloudflare Pages for the static frontend, with Cloudflare Workers or Pages Functions only where server-side functionality is needed.
- Testing: Vitest, React Testing Library, and Playwright.
- Code quality: ESLint, Prettier, strict TypeScript, and automated CI checks.
- Package manager: npm.

Use stable, mutually compatible package versions. Pin dependencies and include a lockfile.

Do not introduce unnecessary backend services, microservices, or paid APIs.

Never expose the Supabase service-role key, OAuth client secret, or any other privileged secret in frontend code.

## 4. Design System — Neo-Brutalism

The entire application must use a consistent Neo-Brutalist mobile-app design inspired by modern independent finance and lifestyle products.

Visual direction:

- Bright yellow as the primary color.
- Electric pink, cobalt blue, lime green, off-white, and black as supporting colors.
- Thick black borders, typically 2–3 px.
- Bold, readable typography.
- Hard offset shadows, such as 4px 4px 0px black.
- Large rounded-rectangle cards with controlled, consistent corner radii.
- Oversized rupee amounts and expressive typography.
- Playful stickers, small illustrations, avatars, and emoji used purposefully.
- High-contrast buttons with obvious pressed, hover, disabled, and loading states.
- Strong visual hierarchy and generous spacing.
- Bottom navigation on mobile and an appropriate sidebar or compact navigation on desktop.

Avoid generic SaaS dashboards, glassmorphism, excessive gradients, tiny text, and meaningless decoration.

The UI should feel lively but remain usable for people who are not comfortable with financial apps.

Build reusable design tokens and components, including:

- Button
- Input
- Card
- Avatar
- Badge
- Modal and confirmation dialog
- Toast notification
- Skeleton loader
- Empty state
- Expense card
- Balance card
- Group card
- Settlement card
- Animated money-flow diagram
- Accessible navigation

Support responsive layouts, keyboard navigation, reduced-motion preferences, and WCAG 2.2 AA accessibility targets.

## 5. Authentication and Onboarding

Build complete, functional authentication screens.

### Sign-up screen

Include:
- Full name.
- Email address.
- Password.
- Confirm password where appropriate.
- Google sign-in button.
- Terms and privacy links.
- Validation and helpful error messages.
- Loading and success states.

### Login screen

Include:
- Email and password.
- Google sign-in.
- Forgot-password flow.
- Email verification or confirmation messaging where required.
- Error handling for incorrect credentials.
- Loading states and redirect handling.

### Google OAuth integration

Implement Google OAuth through Supabase Auth.

Use the supported Supabase sign-in method and redirect-based OAuth flow.

Document how to:
1. Create a Google Cloud project.
2. Configure the OAuth consent screen and authorized domains.
3. Create Google OAuth credentials.
4. Configure the Google client ID and client secret in Supabase Auth provider settings.
5. Add the correct Supabase callback URL to Google Cloud.
6. Add local development and production redirect URLs to Supabase's redirect allowlist.
7. Configure the Cloudflare production domain.
8. Test first-time Google login, returning-user login, logout, and OAuth errors.

Do not hardcode OAuth secrets.

Use secure session handling and the official Supabase client. Ensure sessions persist appropriately and users are redirected to their own dashboard after authentication.

Handle email verification, expired sessions, logout, password reset, and authentication failures.

### Onboarding

After the first successful login, guide the user through:
- Confirming their display name.
- Optionally uploading a profile picture.
- Creating their first group or joining an existing group through an invitation.
- Understanding the three basic concepts: add an expense, split it, and settle up.

Returning users should skip onboarding when it is complete.

## 6. User-Specific Dashboards

Every authenticated user must have a genuinely personalized dashboard.

Never show every user the same hardcoded balances, transactions, or group information.

Retrieve data for the currently authenticated user from Supabase, and authorize every operation using the user's identity and database permissions.

Dashboard components:

### Greeting
Examples:
- “Yo, Rahul! Kya scene hai?”
- “Bhai, aaj ka hisaab.”
- “All sorted? Almost!”

### Personal balance summary
Display:
- Total you owe others.
- Total others owe you.
- Net balance.
- Number of unsettled expenses.
- Number of groups.
- Recent settlements.

Clearly distinguish money owed from money you are owed. A net balance must not obscure gross amounts.

### Groups
Display each group with:
- Group name and icon.
- Member avatars.
- Group expense total.
- The current user's net balance within that group.
- Pending settlement count.

### Recent activity
Show who added an expense, who paid, the expense amount, when it happened, and the current user's share.

### Quick actions
- Add expense.
- Create group.
- Join group.
- Settle up.
- View all balances.

Include helpful empty states for brand-new accounts.

The dashboard must refresh correctly after relevant changes, including expense creation, expense editing, member inclusion changes, and settlements.

## 7. Groups and Membership

Users can:
- Create groups.
- Edit group names, descriptions, and avatars.
- Invite others through secure invitation links.
- Join a group through a valid invitation.
- View group members.
- Add or remove members subject to permissions and existing financial obligations.
- View group-specific expenses and balances.
- Leave groups when doing so will not invalidate financial records or bypass outstanding obligations.

Group roles:
- Owner.
- Admin.
- Member.

Implement role-based permissions in the database, not just in the frontend.

A user must not be able to access another group's expenses by guessing a URL or changing an ID in a request.

Invitation tokens must be unguessable, revocable, and expire when appropriate. Store token hashes where practical.

Preserve financial history and historical participant identities when membership changes.

## 8. Expense Management

Users can create, view, edit, and delete expenses, subject to permissions and an auditable financial history.

Each expense should support:

- Description.
- Amount in INR.
- Group.
- Category.
- Expense date.
- One or multiple payers.
- A configurable paid amount for each payer.
- Participants included in the expense.
- Participants excluded from the expense.
- Split method.
- Notes and optional receipt attachment.
- Creator and timestamps.

Categories include:
- Food and drinks.
- Groceries.
- Rent.
- Bills.
- Travel.
- Shopping.
- Entertainment.
- Medical.
- Other.

### Supported split methods

1. Equal split.
2. Exact amount per participant.
3. Percentage split.
4. Shares or weighted split.

Validate every split so that the participant shares add up to the expense total, within the precision rules for currency.

### Excluded members — a critical feature

For each individual expense, users must be able to explicitly include or exclude group members.

Example:

Expense: Dinner, ₹1,500.

- Rahul paid ₹1,500.
- Rahul, Priya, and Amit participated.
- Neha did not attend and is excluded.

The application must split ₹1,500 among the three included people. Neha must receive zero liability for this expense.

Do not automatically split every expense across all group members.

Show an explicit participant selector with checkboxes, avatars, and an included/excluded status.

If an excluded person paid some or all of an expense, handle the payment and participant shares correctly: the payer may be owed reimbursement even if they did not consume the expense.

### Editing and deletion

When an expense is changed:
- Validate permissions.
- Recalculate affected balances.
- Preserve an audit trail.
- Update the dashboard and relevant group views.
- Prevent stale or duplicate financial records.

Prefer soft deletion or audited reversal of financial records rather than destructive deletion of settled financial history.

Use database transactions or carefully designed RPC functions where multiple financial records must change together.

## 9. The Animated Money-Flow Experience

This is the application's signature feature.

Build a reusable interactive visualization that translates expense calculations into a clear flow of money.

For each expense or group balance, show:

- The original payer or payers.
- The expense amount.
- The included participants.
- Each person's calculated share.
- Excluded members with a clear “Not included” label.
- Payments already recorded.
- Outstanding balances.
- Recommended transfers to settle debts.

### Visual language

Use avatars or labeled initials as nodes. Draw arrows between people. Place amounts directly on the arrows.

Examples:

Rahul → Priya: ₹450

Amit → Rahul: ₹200

Neha: Not included in this expense.

When a user opens an expense:
1. Animate the payer node into view.
2. Reveal included participants.
3. Show the amount allocated to each person.
4. Animate the allocation arrows.
5. Display each person's resulting balance.
6. Show what remains unpaid.

Use meaningful animation sequencing, subtle spring transitions, and clear status indicators.

### Settlement animation

When a settlement is successfully recorded:
- Animate the relevant outstanding amount decreasing.
- Update the arrow and balance labels.
- Show a success state such as “Scene sorted!”
- Refresh the related group and personal dashboard.

Never mark a payment as completed merely because an animation finished. Update the UI only after the authoritative backend operation succeeds.

Provide a nonanimated equivalent for reduced-motion settings and accessibility.

### Diagram requirements

The diagram must remain understandable on small screens. Use expandable or scrollable layouts for large groups, and never depend on color alone to explain payment direction.

Always show the exact amount in text, the payer, the recipient, and whether the transfer is suggested, pending, or recorded.

## 10. Debt Simplification Algorithm

Implement a deterministic, tested debt-settlement algorithm.

For every group:
1. Compute each user's total paid amount.
2. Compute each user's total allocated expense share.
3. Calculate each user's net balance: amount paid minus amount owed.
4. Generate a set of suggested transfers that settles the group's net balances.
5. Display the minimum number of transfers when practical for the supported constraints, or use a documented deterministic greedy algorithm that produces a valid, low-transfer settlement plan.

For the basic implementation, use a greedy debtor-creditor matching algorithm:
- People with negative net balances are debtors.
- People with positive net balances are creditors.
- Match debtors with creditors.
- Transfer the minimum of the outstanding debt and outstanding credit.
- Repeat until all balances are settled.

Important: a greedy algorithm does not guarantee the mathematically minimum number of transfers in every case. Document this trade-off rather than claiming optimality.

Use integer paise or another exact decimal representation. Never use floating-point arithmetic for financial calculations.

Ensure that:
- The sum of net balances is zero, apart from explicitly documented rounding adjustments.
- No settlement exceeds the remaining debt or credit.
- Excluded members do not incur liability for that expense.
- Settlements reduce the appropriate outstanding balances exactly once.
- Repeated requests do not create duplicate financial effects.

Suggested settlements are recommendations, not actual transfers of money. Do not claim to execute UPI transactions unless a real payment integration has been separately implemented and authorized.

## 11. Settlement and Payment Tracking

Users can:
- View suggested transfers.
- Open the details of a proposed transfer.
- Mark a transfer as paid after confirmation.
- Record the payment date and amount.
- View settlement history.
- Correct or reverse mistaken settlement records with appropriate permissions and audit history.

Clearly distinguish:
- Suggested transfer.
- Payment reported by a user.
- Confirmed or reconciled payment, if a verification mechanism exists.

For the initial release, do not pretend that a manually reported payment is independently verified.

Use idempotency protection and database transactions for settlement recording.

Do not allow arbitrary users to mark another person's obligations as paid without a clearly defined authorization rule.

Support partial settlements and recalculate remaining balances accurately.

## 12. Indian UX and Microcopy

Use Indian references naturally.

Sample messages:
- “Bhai, hisaab clear kar!”
- “Kisne diya paisa?”
- “Tera kitna banta hai?”
- “Ab tera number!”
- “Udhaar pending hai.”
- “Scene sorted!”
- “Bhai, is expense mein tu nahi tha.”
- “Kisko kitna dena hai?”
- “Split ho gaya, tension khatam.”

Use Indian date and currency conventions:
- Currency: INR.
- Display currency as ₹1,500 or ₹1,50,000 where appropriate.
- Use the Asia/Kolkata timezone for user-facing date handling unless the user explicitly selects another timezone.
- Store timestamps consistently in UTC.
- Keep date-only expense values distinct from timestamps.

Support decimal currency inputs, paise precision, and sensible rounding.

Never round each participant's share independently in a way that makes the total differ from the original expense. Apply deterministic residual allocation so every paise is accounted for.

## 13. Required Screens

Implement all of the following:

1. Landing page.
2. Sign-up page.
3. Login page.
4. Forgot-password and reset-password screens.
5. Email verification or confirmation state.
6. Onboarding flow.
7. Personalized dashboard.
8. Group list.
9. Create/edit group.
10. Group detail and activity feed.
11. Add/edit expense.
12. Expense detail with animated split visualization.
13. Group balances and settlement suggestions.
14. Record-settlement flow.
15. Personal activity history.
16. Profile and account settings.
17. Invitation acceptance screen.
18. Notifications or in-app activity updates.
19. Not-found page.
20. Unauthorized/access-denied and recoverable error states.

Build responsive desktop and mobile layouts.

The app must work well at 320px viewport width and at standard desktop sizes.

## 14. Database Architecture — Supabase PostgreSQL

Design a normalized, migration-managed schema.

Include tables for at least:

- profiles
- groups
- group_members
- group_invitations
- expenses
- expense_payers
- expense_participants
- settlements
- notifications
- audit_logs

Add additional tables for exact split allocations, settlement allocations, or idempotency records where the design requires them.

Requirements:
- UUID primary keys.
- Foreign keys and referential integrity.
- Appropriate uniqueness constraints.
- CHECK constraints for valid positive amounts and permitted states.
- Indexes on foreign keys and common query filters.
- Created/updated timestamps.
- Consistent monetary precision.
- Explicit lifecycle and soft-deletion strategy where appropriate.
- Migration files that can be applied from a clean database.
- Seed data for local development only.

Use Supabase Auth's user ID as the identity reference for profiles. Do not build a separate insecure password system.

### Row Level Security

Enable RLS on every table that contains user, group, expense, settlement, or financial information.

Policies must enforce:
- Users can read their own profile and permitted profile information of their group members.
- Users can access expenses only through authorized group membership.
- Users cannot read another unrelated group's balances or settlements.
- Only authorized users can create, update, or delete permitted records.
- Group membership and invitation changes are restricted by role and valid invitation state.
- Audit records cannot be freely edited or deleted by ordinary members.
- Users cannot assign themselves an owner/admin role by editing a request.
- Users cannot spoof another user's identity or payment attribution.

Design policies that avoid recursive RLS problems. Use carefully scoped security-definer functions only when necessary, with a fixed search path and explicit permission checks.

Do not trust client-supplied user IDs, calculated balances, payer identities, or settlement amounts. Derive identity from the authenticated context and validate financial operations on the server/database.

Do not expose the service-role key to the browser.

## 15. Backend and Financial Integrity

Use server-side PostgreSQL functions/RPCs or appropriately secured server-side functions for operations that must be atomic.

Financial calculations should have a single authoritative implementation, with shared test vectors for the frontend visualization.

Validate:
- Positive expense amounts.
- Payer amounts sum to the total.
- Participant shares sum to the total.
- Only valid group members can participate.
- Excluded participants receive no liability.
- The authenticated user has permission to modify the record.
- Settlement amounts do not exceed valid outstanding obligations.
- Concurrent settlement requests cannot overpay a debt.
- Duplicate requests do not create duplicate financial effects.

Use optimistic concurrency or database locking where necessary.

Maintain a consistent source of truth for balances. Prefer deriving balances from authoritative expense allocations and settlement records or maintaining a transactionally updated ledger with reconciliation checks. Do not mix independent, potentially inconsistent sources of truth.

Create unit tests for the financial engine, including:
- Equal splits.
- Unequal splits.
- Multiple payers.
- Excluded members.
- A payer who is excluded from participation.
- Rounding and paise allocation.
- Partial settlement.
- Multiple creditors and debtors.
- Editing expenses.
- Reversals.
- Duplicate requests.
- Concurrent settlement attempts.

## 16. Security and Privacy

Implement:
- Supabase Auth session management.
- Strict database RLS.
- Server-side input validation.
- Secure invitation tokens.
- Rate limiting for sensitive server-side endpoints where appropriate.
- Safe error messages that do not reveal secrets or private records.
- Input sanitization where applicable.
- Secure HTTP headers and production HTTPS.
- Environment variable validation.
- No sensitive tokens in URLs beyond short-lived, purpose-specific invitation tokens.
- No passwords, access tokens, or service keys in logs.
- Appropriate file upload limits and private receipt storage policies if receipts are implemented.
- Account deletion and data export workflows consistent with the product's retention policy.

Document threat assumptions and the security-sensitive operations.

Never claim the app is audited or fully secure merely because these controls are implemented.

## 17. Cloudflare Deployment

Prepare the frontend for deployment to Cloudflare Pages.

Include:
- Production build configuration.
- Correct SPA fallback/routing behavior.
- Environment variable documentation.
- Preview and production environment separation.
- Custom-domain instructions.
- HTTPS verification.
- Cache behavior that does not expose private user data.
- Correct configuration for client-side routing.
- A Cloudflare Pages Functions or Workers example only when server-side operations actually require it.
- CI build and test workflow.

Do not assume Cloudflare Pages has access to arbitrary Node.js server APIs.

Keep database migrations and privileged administrative operations out of the public frontend build.

Document the relationship between the Cloudflare domain, Google OAuth callback, Supabase Auth settings, and redirect allowlist.

## 18. Environment Configuration

Create a safe `.env.example` with placeholders for required settings.

For example:

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_APP_URL=

Use the appropriate current Supabase publishable key naming where applicable. Explain that publishable/legacy anon keys are intended for client use only when RLS is correctly enforced.

Do not include real credentials.

Keep any server-only secrets outside `VITE_` variables because Vite exposes variables with that prefix to browser code.

Validate configuration on startup and show a helpful setup error if a required value is missing.

## 19. Notifications and Live Updates

Use Supabase Realtime where it adds real value.

Support in-app activity updates for:
- New expenses.
- Expense edits.
- Settlement updates.
- Group invitations.
- Relevant balance changes.

Subscriptions must be scoped to authorized records. Clean up subscriptions when components unmount.

The application must still work if realtime delivery is temporarily unavailable; implement refetching or refresh behavior.

Do not introduce paid messaging services as a requirement for the first release.

## 20. Performance and Reliability

Implement:
- Route-level code splitting where beneficial.
- Reusable loading and error states.
- Database pagination for activity feeds.
- Efficient indexed queries.
- Sensible caching without leaking private data.
- Optimistic updates only where rollback is reliable.
- Error boundaries.
- Retry behavior for safe operations.
- Duplicate-submission protection.
- Mobile-first performance.
- Accessible forms and dialogs.

Avoid unnecessary network requests and excessive animations that interfere with low-end devices.

## 21. Testing Requirements

Provide actual runnable tests.

### Unit tests
Test money calculations, split validation, rounding, debt simplification, and settlement logic.

### Component tests
Test forms, participant selection, expense summaries, authentication states, and relevant accessibility behaviors.

### Integration tests
Test authenticated data access, database constraints, RLS policies, group permissions, and settlement transactions against a local/test Supabase environment.

### End-to-end tests
Cover:
1. New user registration.
2. Google OAuth setup-dependent flow.
3. Login and logout.
4. Personalized dashboard loading.
5. Creating a group.
6. Joining through an invitation.
7. Adding an expense.
8. Excluding a participant.
9. Viewing money-flow diagrams.
10. Recording a partial settlement.
11. Recalculating balances.
12. Preventing access to an unrelated group.
13. Handling invalid or expired invitations.
14. Password reset.

Google OAuth E2E tests may require configured credentials or a documented mocked-provider strategy.

Do not mark tests as passing unless they have actually been run.

## 22. Required Repository Structure

Use a clear structure similar to:

src/
  app/
  components/
  features/
    auth/
    dashboard/
    groups/
    expenses/
    balances/
    settlements/
    profile/
  hooks/
  lib/
    supabase/
    money/
    validation/
  routes/
  styles/
  types/
  test/

supabase/
  migrations/
  seed.sql
  tests/

e2e/
docs/
.github/workflows/

Adapt this structure if there is a strong architectural reason, but keep responsibilities clearly separated.

## 23. Documentation Deliverables

Create these documentation files:

### README.md
Explain the application, features, prerequisites, local installation, commands, environment configuration, and troubleshooting.

### docs/GOOGLE_OAUTH_SETUP.md
Provide step-by-step Google Cloud and Supabase configuration with the exact locations of relevant settings, callback URL format, local development configuration, production configuration, and common OAuth errors.

### docs/SUPABASE_SETUP.md
Explain how to create a project, apply migrations, configure authentication, enable and verify RLS, seed test data, and run local integration tests.

### docs/CLOUDFLARE_DEPLOYMENT.md
Explain how to build and deploy the application, configure environment variables, connect a custom domain, configure OAuth redirects, and verify production behavior.

### docs/ARCHITECTURE.md
Explain the application architecture, data model, financial calculation engine, debt-simplification algorithm, trust boundaries, and key security decisions.

### docs/TESTING.md
Explain how to run unit, integration, and end-to-end tests.

### docs/PRODUCTION_CHECKLIST.md
Include security, database, authentication, observability, backup, domain, privacy, performance, and release-readiness checks.

Include a Mermaid architecture diagram and a database relationship diagram.

## 24. Implementation Workflow

Work in phases, but keep building toward a complete application.

Phase 1: Architecture, project initialization, design system, database schema, migrations, and security policies.

Phase 2: Authentication, Google OAuth integration, onboarding, and personalized dashboards.

Phase 3: Groups, invitations, expense creation, editing, participant inclusion/exclusion, and exact split calculations.

Phase 4: Balance engine, debt simplification, settlement recording, and animated money-flow diagrams.

Phase 5: Notifications, responsive polish, accessibility, security hardening, and error handling.

Phase 6: Unit, integration, and E2E testing, deployment configuration, and documentation.

After each phase, run the relevant checks and fix failures before proceeding.

Do not stop after creating the frontend. Do not replace real data with mock data in production screens.

Use mock or seed data only in explicitly labeled development/test environments.

## 25. Definition of Done

The implementation is complete only when:

- The application runs locally using documented commands.
- Users can sign up and log in.
- Google OAuth can be configured using the supplied guide.
- Each user sees their own authorized dashboard.
- Users can create and join groups.
- Users can record expenses with different split types.
- Users can exclude participants from individual expenses.
- Balances are calculated correctly using exact currency arithmetic.
- Settlement recommendations are valid.
- Partial settlements and reversals work correctly.
- Animated diagrams match the authoritative financial calculations.
- Database RLS prevents unauthorized access.
- Migrations work against a clean database.
- Automated tests are runnable and failures are addressed.
- The production build succeeds.
- Cloudflare deployment steps are documented.
- There are no hardcoded secrets or fake authentication flows.
- All known unimplemented features and remaining production blockers are clearly documented.

## 26. Final Response Expected From You

When implementation is complete, provide:

1. A concise summary of what was built.
2. The complete project file tree.
3. Installation and local development commands.
4. Supabase setup instructions.
5. Google OAuth configuration instructions.
6. Cloudflare deployment instructions.
7. Environment variables and where each value comes from.
8. Database schema and RLS summary.
9. Test commands and actual results.
10. A list of production blockers, if any.
11. A manual smoke-test checklist.
12. A list of any third-party services or paid features that are optional.

If you have repository access, create and modify the actual files rather than dumping thousands of lines into the chat. If you cannot access a repository, generate the project in manageable, clearly labeled files and provide exact file paths.

Do not invent successful deployments, passing tests, configured OAuth credentials, or security audits.

Prioritize correctness, security, usability, and maintainability over flashy but incomplete features.

**Now begin by inspecting the available environment, establishing the architecture, and implementing the application. Do not stop at a plan or a design mockup.**