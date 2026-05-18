# AcmeAdvisory

Meridian Wealth Advisors client onboarding demo for Documenso Platform embeds.

This standalone Next.js app shows a realistic RIA onboarding flow:

- Kanban pipeline with Prospect, Onboarding, and Active columns
- Prospect detail page for Margaret Liu and other mock households
- Server-created Documenso documents from 3 templates:
  - Investment Management Agreement (IMA)
  - Fee Acknowledgment
  - ADV Part 2 Disclosure
- Sequential embedded signing with `EmbedSignDocument`
- Neon + Prisma persistence for live onboarding state

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS v4 + shadcn/ui
- `@documenso/embed-react`
- `@documenso/sdk-typescript`
- Prisma + Neon Postgres

## Required environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
DOCUMENSO_API_KEY=
DOCUMENSO_HOST=
NEXT_PUBLIC_DOCUMENSO_HOST=
DOCUMENSO_TEMPLATE_IMA=
DOCUMENSO_TEMPLATE_FEE_ACK=
DOCUMENSO_TEMPLATE_ADV_DISCLOSURE=
DATABASE_URL=
```

## Local setup

```bash
bun install
bun run db:generate
bun run db:push
bun run db:seed
bun dev
```

## Demo flow

1. Open `/`
2. Click Margaret Liu in the Prospect column
3. Click Start Onboarding and enter an email
4. The server creates all 3 Documenso documents from templates
5. Sign the IMA, Fee Acknowledgment, and ADV disclosure in sequence
6. Return to the pipeline and confirm the card moved to Active

## Data model

`ClientSession` stores the live onboarding state for one household:

- `prospectId`
- `email`
- `pipelineStage`
- `imaToken`, `imaSigned`
- `feeToken`, `feeSigned`
- `advToken`, `advSigned`
- `createdAt`, `updatedAt`

## Notes

- Prospect profile data is mock data.
- Signing is real and uses the Documenso API.
- `prisma/seed.ts` seeds a couple of already-active households so the Active column is populated on first run.
