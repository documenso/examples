/**
 * Documenso Embed integration helpers
 *
 * This application uses Documenso's v2-beta API to generate signing documents from templates.
 *
 * Flow:
 * 1. Contract is created via POST /api/contracts (no Documenso integration at this step)
 * 2. User visits /contract/sign/[id] page
 * 3. Frontend calls /api/contracts/[id]/signing-token with userId
 * 4. API fetches template details from Documenso (GET /api/v2-beta/template/{id})
 * 5. API generates document from template (POST /api/v2-beta/template/use) with both recipients
 * 6. API returns the signing token for the current user
 * 7. Frontend uses EmbedSignDocument component with the token (stored in component state only)
 * 8. onDocumentCompleted callback handles post-signing actions (e.g., navigate to milestones)
 *
 * Environment variables required:
 * - DOCUMENSO_API_KEY: API key for authentication (from stg-app.documenso.com/settings/tokens)
 * - DOCUMENSO_TEMPLATE_ID: Template ID with 2 recipients configured
 * - NEXT_PUBLIC_DOCUMENSO_HOST: Documenso instance URL (defaults to https://stg-app.documenso.com)
 */
