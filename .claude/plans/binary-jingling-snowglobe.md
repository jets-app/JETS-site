# JETS School Management Platform — Implementation Plan

## Context
JETS school currently uses Rediker for registration and Chabad Management Software (CMS, $79/mo) for some management functions. They need a modern, custom-built platform that handles the full student lifecycle: application, review, document signing, tuition billing, parent communication, and alumni tracking. The system should integrate with QuickBooks for seamless accounting. By building CMS-equivalent features into this platform, JETS can eliminate the $79/mo CMS cost. This is a greenfield build.

## Tech Stack
- **Next.js 15** (App Router) — full-stack framework with Server Actions
- **PostgreSQL + Prisma** — relational DB for complex school data relationships
- **NextAuth v5** — authentication with 3 roles: PARENT, ADMIN (office), PRINCIPAL + REVIEWER (committee members)
- **Twilio** — SMS messaging alongside email
- **Tailwind CSS + shadcn/ui** — premium, customizable component library
- **Stripe** — application fees + tuition payments + invoicing
- **Resend + React Email** — branded transactional emails
- **UploadThing** — student photo uploads
- **@react-pdf/renderer** — print applications & generate invoices
- **react-signature-canvas** — DocuSign-like e-signatures
- **Zod + React Hook Form** — shared validation client & server
- **TanStack Table** — sortable/filterable admin data tables
- **Zustand** — multi-step form wizard state
- **QuickBooks Online API** — sync invoices, payments, and financial data to QuickBooks

## Database Schema (Key Entities)
- **User** (email, role: PARENT/ADMIN/PRINCIPAL)
- **Application** (status machine: DRAFT→SUBMITTED→OFFICE_REVIEW→PRINCIPAL_REVIEW→ACCEPTED→DOCUMENTS_PENDING→ENROLLED)
- **Student** (1:1 with Application — personal, academic, medical info)
- **Recommendation** (token-based public form for references)
- **Document** (from templates, sent to parents for e-signing)
- **DocumentTemplate** (medical forms, handbooks, contracts — admin-editable)
- **ApplicationReview** (office & principal review records with comments)
- **Payment** (Stripe-integrated, tracks fees & tuition)
- **Invoice** (line items, due dates, PDF generation)
- **ScholarshipApplication** (financial info, essay, review)
- **Message** (admin↔parent messaging, also sent as email)
- **Alumni** (graduated students — name, graduation year, grade, contact info, notes, photo)
- **AlumniYear** (graduation year groupings with class stats)
- **QuickBooksSync** (tracks sync status between JETS billing and QuickBooks)
- **Donor** (full profile — name, contact info, tags, notes, linked donations)
- **Donation** (amount, date, method, campaign/purpose, receipt status, Stripe charge ID)
- **DonorReceipt** (tax receipt records — per-donation or annual summary, PDF, email sent status)
- **DonorLetterTemplate** (thank you letter and receipt templates — editable by admin)

## Project Structure
```
src/
├── app/
│   ├── (auth)/          — login, register
│   ├── (portal)/        — parent-facing: dashboard, applications, documents, payments, messages
│   ├── (admin)/         — office staff: dashboard, all applications, documents, billing, scholarships, messaging
│   ├── (review)/        — principals: review queue, decisions
│   ├── (admin)/alumni/  — alumni directory by year, search, profiles
│   ├── (admin)/donors/  — donor database, donation history, receipts, charge donations
│   ├── r/[token]/       — public recommendation form (no auth)
│   ├── d/[token]/       — public document signing (no auth)
│   └── api/             — webhooks (Stripe), uploadthing, auth
├── server/
│   ├── db.ts, auth.ts
│   └── actions/         — Server Actions by domain (application, review, document, payment, message, etc.)
├── components/          — ui/, layout/, application/, documents/, billing/, review/, messaging/, dashboard/
├── lib/                 — stripe, resend, uploadthing, pdf, quickbooks, validators/
├── emails/              — React Email templates
└── stores/              — Zustand stores
```

## Implementation Order (8 Sprints)

### Sprint 1: Foundation
- Initialize Next.js 15 + Tailwind + shadcn/ui
- Prisma schema + PostgreSQL setup + migration
- NextAuth v5 with credentials provider + role-based JWT
- Auth pages (login, register) + middleware route protection
- Root layout with premium fonts + theme

### Sprint 2: Parent Application Portal
- Portal layout (sidebar, header, responsive)
- Multi-step application form wizard (10 steps mapped from current Rediker form):
  - **Step 1: Student Info** — preferred name, DOB, cell, email, full address (international support), family phone
  - **Step 2: Hebrew Name** — applicant's Hebrew name, father's Hebrew name, mother's Hebrew name (for Torah reading)
  - **Step 3: Parents/Guardian Info** — father info (salutation, name, phone, email, address, marital status, occupation), mother info (same), guardian conditional section, emergency contact
  - **Step 4: Family Info** — siblings (name, age, phone, email), grandparents (both sides names + emails)
  - **Step 5: School History** — last school's principal + teacher (name, phone, email), previous schools list (past 2 years), relatable contacts (rabbi, mashpia, teacher)
  - **Step 6: Parent Questions** — time gaps since school, summers, learning strengths/limitations, social strengths, midos tovos, special learning needs, physical/emotional needs, counseling history, maturity assessment for younger applicants
  - **Step 7: Applicant Assessment** — rated scales (Excellent/Above Average/Average/Needs Development/Poor) + comments for: Yiras Shamayim, Honesty & Ethics, Work Habits, Social Interactions, Anger Issues, Maturity Level
  - **Step 8: Studies & Trades** — academic self-assessment (English R/W, Math, Hebrew R/W/Comprehension, Gemarah, Chassidus) + trade interest ratings (Accounting, Business, Computers, Construction, Photoshop, Electrical, Real Estate, Finance, Marketing, Web Dev, EMT) + extracurricular interests (Culinary, Music, Martial Arts, Gym, Sports)
  - **Step 9: Essay & Additional** — essay ("why do you want to join our Yeshiva"), GED interest, Gemarah/Chassidus/Halacha material studied, other factors
  - **Step 10: Photo, Recommendations & Review** — upload student photo, add 2 recommendation references (name, email, relationship), review all answers, submit
- Server Actions for create/update/submit application
- Photo upload via UploadThing
- Parent dashboard showing application statuses
- Application fee: $500 with discount code support, configurable amount
- **Submission requirements (ALL must be met before "Submit" button is enabled):**
  1. All 10 form steps completed (no empty required fields)
  2. Student photo uploaded
  3. Both recommendation letters received (submitted by referees)
  4. $500 application fee paid
- Parents can see recommendation STATUS from their side (Pending/Submitted checkmark) but CANNOT see the content
- Progress tracker on parent dashboard shows which requirements are met and which are still pending

### Sprint 3: Recommendation System
- Parents add referees during application: name, email, phone, relationship (past teacher, principal, rabbi, etc.)
- System auto-sends recommendation form to referee via email (+ SMS notification via Twilio)
- Public `/r/[token]` form page — referee fills out structured recommendation (no account needed)
- Completed recommendations go DIRECTLY to admin system — **parents can see STATUS only (Pending / Submitted), NOT the content**
- Admin/office/principals can view full recommendation content for an application
- Status tracking per referee: Pending, Sent, Viewed, Completed, Expired
- Both recommendations must be COMPLETED before parent can submit the application
- Admin can resend the request if referee hasn't responded

### Sprint 4: Admin Dashboard & Application Management
- Admin layout + sidebar navigation
- Dashboard with stats cards (pipeline counts, pending items)
- Applications data table (search, filter, sort, paginate)
- Single application detail view with notes/annotations
- Completion checklist per application

### Sprint 5: Review & Acceptance Workflow (Full Pipeline)
The complete flow from application received to officially enrolled:

**Step A: Office Receives Application**
- Application lands in admin dashboard
- Office does initial review (completeness check)
- Forwards to principals

**Step B: Principal Review**
- Principals review full application
- Call the recommendation references to verify
- Research/look into the student
- If student is a good fit → click "Move to Interview" button

**Step C: Interview**
- System auto-sends email to parents with Calendly link to schedule interview
- Track interview status: Scheduled / Completed / No-show
- After interview, principals decide: Accept or Reject
- If accepted → click "Accept Student" button → goes back to office

**Step D: Office Sends Enrollment Documents**
- Office sends document package to parents AND student:
  - Medical form (to parents)
  - Student handbook — **sent SEPARATELY to both parent AND student** (each signs their own copy)
  - Tuition contract (to parents)
  - Enrollment agreement (to parents)
- If parents want to apply for scholarship → office sends scholarship application

**Step E: Scholarship (if applicable)**
- Parents fill out scholarship / Pay It Forward application
- Admin reviews with tuition affordability assessment
- Once scholarship is decided:
  - Tuition contract is UPDATED with adjusted amount
  - Pay It Forward scholarship contract is sent to STUDENT to sign

**Step F: Officially Enrolled**
- ALL signed documents received back (medical, handbook x2, tuition contract, enrollment agreement, + scholarship contract if applicable)
- Student status changes to ENROLLED — officially a student in the system

**Status flow:** SUBMITTED → OFFICE_REVIEW → PRINCIPAL_REVIEW → INTERVIEW_SCHEDULED → INTERVIEW_COMPLETED → ACCEPTED → DOCUMENTS_PENDING → SCHOLARSHIP_REVIEW (if applicable) → ENROLLED

### Sprint 6: Document Management & E-Signing
- Document template CRUD for document types:
  - Medical form → sent to PARENTS (with insurance info — doubles as doctor visit card)
  - Student handbook → sent SEPARATELY to PARENTS and STUDENT (each signs their own copy)
  - Tuition contract → sent to PARENTS (can be updated after scholarship decision)
  - Enrollment agreement → sent to PARENTS
  - Pay It Forward scholarship contract → sent to STUDENT (only if scholarship awarded)
- Admin customizes any template before sending
- Public `/d/[token]` signing page with signature pad (works for both parents and students)
- Track document completion status per recipient
- PDF generation of signed documents
- **Once ALL required documents are signed back → student status auto-changes to ENROLLED**

### Sprint 7: Payments & Billing
- Stripe Checkout for $500 application fee (configurable amount)
- Discount/promo code system for application fees
- Webhook handler for payment confirmation
- Custom tuition per student (admin sets amount per student)
- Flexible payment plans: full, semester, quarterly, monthly (admin configurable)
- Admin invoice creation with line items
- Parent tuition payment page (credit card via Stripe)
- Payment history for both sides
- Auto-send payment receipts via email

### Sprint 8: Scholarships, Tuition Assessment, Messaging, Print, Polish
- Scholarship application form (matching current "Pay It Forward" form):
  - Family info, father's income/assets/employment, mother's income/assets/employment
  - Expenses (taxes, housing rent/own, utilities, auto, household)
  - Scholarship request amount + reason + references
  - Tax return upload, signature/certification
- **Tuition Affordability Assessment (built-in, no third-party cost):**
  - Detailed financial form for parents:
    - All income sources (salary, business, investments, rental, government assistance)
    - Assets (bank balances, investments, real estate equity, retirement accounts)
    - Liabilities (mortgage, loans, credit card debt)
    - Monthly expenses (housing, utilities, food, medical, auto, other tuition obligations)
    - Household size + number of children in tuition-charging schools
    - Tax return upload (1-2 years of 1040s, W-2s, business returns if self-employed)
  - Automatic affordability calculation:
    - Total income - essential expenses = available income
    - Recommended family contribution as a percentage of available income
    - Adjustments for: number of children, other tuition, community factors
  - Admin review dashboard:
    - Side-by-side: self-reported data vs. uploaded tax documents
    - System's recommended contribution amount
    - Admin can override/adjust the recommendation
    - Historical tracking across all families
  - Optional FACTS cross-reference: field for admin to enter third-party FACTS recommendation for validation
- Admin scholarship review page
- Messaging center:
  - Individual messages to parents (email + SMS via Twilio)
  - Bulk messaging: send to all parents, or filtered groups (by status, grade, year)
  - Message templates for common communications
- Print full application as PDF (all 10 steps)
- Loading states, error handling, responsive polish

### Sprint 8.5: Public-Facing Website
- Replace current jetsschool.org with modern pages built into the platform:
  - **Home** — hero, mission, programs overview, CTA to apply
  - **About** — school history, Torah V'avodah mission, campus info (Granada Hills, 9-10 acres)
  - **Programs** — trade programs, Judaic studies, extracurriculars
  - **Faculty** — staff directory with photos and bios
  - **Apply** — flows directly into registration/application portal
  - **Contact** — address, phone (818-831-3000), email, consultation booking (Calendly embed)
- Burgundy/maroon (#A30018) brand color, premium institutional design
- Mobile responsive, SEO optimized
- Match Webflow site structure but with MUCH better design and real content

### Sprint 9: Alumni Management
- Alumni database model (linked to graduated students or manually added)
- Alumni directory page — browse by graduation year
- Alumni profile pages (name, photo, graduation year, grade, contact info, notes)
- Search/filter alumni across all years
- Bulk import tool (CSV) for existing alumni data
- Stats per year (class size, etc.)
- When a student graduates/completes enrollment, option to move them to alumni

### Sprint 10: QuickBooks Integration & CMS Replacement
- **QuickBooks Online API integration:**
  - OAuth2 connection flow (admin connects their QB account)
  - Auto-sync invoices from JETS → QuickBooks when created
  - Auto-sync payments received → QuickBooks when paid
  - Sync customer/parent records as QB customers
  - Dashboard showing sync status and any errors
- **Donor Management (replaces CMS — saves $79/mo):**
  - Donor database: full profiles (name, address, phone, email, notes, tags)
  - Donation tracking: record every donation with date, amount, method, campaign/purpose
  - Donation history per donor with lifetime totals, yearly summaries
  - Charge donations via Stripe (one-time + recurring credit card charges)
  - Auto-generate and email tax-deductible donation receipts (year-end and per-donation)
  - Thank you letter templates — auto-send or batch-send via email
  - Donor search, filter, and export (CSV)
  - Donor dashboard: total raised, recent donations, top donors, campaign breakdowns
  - Credit card tuition charging (already in Sprint 7, shared Stripe infrastructure)

## Key Details
- **School**: Jewish Educational Trade School (DBA), legal entity: JETS Synagogue, EIN: 68-0500418
- **Students**: Ages 17-21, post-secondary Yeshiva + vocational program
- **Location**: Granada Hills, Los Angeles, CA
- **Application fee**: $500 (configurable, with discount codes)
- **Volume**: 50-150 applications/year
- **Application year**: switches at a configurable point in the year
- **Recommendations**: 2 required per application
- **Review**: Principal + committee review (not just one person)
- **Interviews**: Calendly integration (already using Calendly)
- **Tuition**: Custom per student, flexible payment plans
- **Donors**: 2000+ in database, mix of one-time + recurring
- **Staff**: 1-3 admin users
- **Parents**: Self-register, then start application
- **Messaging**: Email + SMS (Twilio), bulk + individual
- **Brand**: Burgundy/maroon (#A30018), premium institutional feel
- **QuickBooks**: QuickBooks Online (cloud), sync invoices + payments
- **Deployment**: Build locally, launch when ready

## Authorization Model
- **Public routes**: `/`, `/about`, `/programs`, `/faculty`, `/contact`, `/login`, `/register`, `/r/*`, `/d/*`, `/api/webhooks/*`
- **Parent routes**: `(portal)/*` — role: PARENT
- **Admin routes**: `(admin)/*` — role: ADMIN
- **Principal/Committee routes**: `(review)/*` — role: PRINCIPAL, REVIEWER, or ADMIN
- Middleware enforces role-based routing; Server Actions verify ownership

## Verification
- Run `npm run dev` and test each feature in browser
- Test parent flow: register → create application → fill all steps → submit
- Test admin flow: login as admin → view dashboard → review application → forward to principal
- Test principal flow: login → review → accept → verify office receives
- Test document signing: admin sends → parent receives link → signs → verify completion
- Test payments: Stripe test mode → pay fee → verify webhook updates DB
