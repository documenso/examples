# AcmeTrials

Clinical-trials demo for Documenso embedding.

## What it demonstrates

- Study dashboard for a mock Phase III Cardio-Renal study
- Four participants with consent state tracking
- Participant detail page with demographics, DOB, site, and protocol version
- Server-side ICF generation from a Documenso template
- `EmbedSignDocument` for inline signing with a signing token
- Status transition to `Consented` with a verified timestamp after signing
- Audit trail page that pulls envelope activity from the Documenso API

No database is used. Consent state generated during the demo is persisted in browser localStorage so the dashboard, participant detail page, and audit page stay consistent in one browser session.

## Routes

- `/` — study dashboard and participant roster
- `/participants/[id]` — participant detail + consent signing
- `/participants/[id]/audit` — Documenso audit trail for the latest signed envelope in this browser session

## Environment variables

Copy `.env.example` to `.env.local` and set:

```bash
DOCUMENSO_API_KEY=your-api-key
DOCUMENSO_HOST=https://app.documenso.com
NEXT_PUBLIC_DOCUMENSO_HOST=https://app.documenso.com
DOCUMENSO_TEMPLATE_ID=your-icf-template-id
```

## Expected Documenso template

Use an informed consent template with:

- A participant signer recipient; the current staging template also includes witness and person-obtaining-consent signers
- Page-1 pre-fillable study fields for study title, protocol number, site name, and sponsor
- Participant signature and date fields
- Copy describing the purpose of the study and risks / benefits

The demo loads the configured template from the Documenso API, selects the participant recipient, and maps the unlabeled page-1 study fields by their template geometry when labels are not present.

## Local development

```bash
bun install
bun dev
```

Then open `http://localhost:3000`.

## Demo flow

1. Open the study dashboard.
2. Click the participant with `Consent Pending`.
3. Enter an email address.
4. The server loads the configured Documenso template, targets the participant signer, and pre-fills the page-1 study metadata before opening the embed.
5. Sign inline in the embed.
6. The participant status updates to `Consented` with the signed timestamp.
7. Open the audit trail page to inspect envelope activity.
