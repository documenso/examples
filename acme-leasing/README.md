# AcmeLeasing

Property-management demo for Documenso embedding. A leasing agent sends Unit 4B's move-in packet, the tenant signs the lease inline, then the pet addendum appears immediately after. When both documents are complete, the unit status updates from `Lease Pending` to `Leased` in the same session.

## Stack

- Node.js and npm
- Next.js 16 App Router
- React 19
- Tailwind CSS v4 + shadcn/ui
- `@documenso/embed-react`
- `@documenso/sdk-typescript`

## Routes

- `/` — property grid with six mock units
- `/units/[id]` — unit detail page with sequential signing for Unit 4B
- `/api/generate-document` — creates a document from the requested Documenso template and returns a signing token

## Environment

Copy `.env.example` to `.env.local` and fill in:

```bash
DOCUMENSO_API_KEY=
DOCUMENSO_HOST=https://app.documenso.com
NEXT_PUBLIC_DOCUMENSO_HOST=https://app.documenso.com
DOCUMENSO_TEMPLATE_LEASE=
DOCUMENSO_TEMPLATE_PET_ADDENDUM=
```

## Template expectations

This demo assumes two Documenso templates exist and their field labels match the form values sent by the API route.

### Lease Agreement

Expected prefill keys:

- `Tenant Name`
- `Unit Number`
- `Monthly Rent`
- `Start Date`
- `End Date`
- `Security Deposit`

### Pet Addendum

Expected prefill keys:

- `Tenant Name`
- `Unit Number`
- `Pet Deposit`

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, click Unit 4B, enter the tenant email, and complete both embedded signing steps.
