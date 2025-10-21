# Document Authoring - Documenso Embedding Example

## Documenso Embedding Features Demonstrated

### Document Creation and Management Embeds

This example shows how to embed **document authoring** - creating and editing documents directly in your application.

**Pattern**: Backend generates presign token → Frontend embeds authoring interface → Users create/edit documents

### Key Features

- **`EmbedCreateDocument`**: Full document creation interface (upload PDF, add recipients, place fields)
- **`EmbedUpdateDocument`**: Edit draft documents
- **Presign Tokens**: Secure authentication without exposing API keys
- **External ID Tracking**: Associate documents with your app entities
- **Event Callbacks**: `onDocumentCreated`, `onDocumentUpdated`
- **Document Lifecycle**: Create → Update → Send

### Code Example

```typescript
// Generate presign token (backend)
const response = await fetch(`${host}/api/v2-beta/embedding/create-presign-token`, {
  method: "POST",
  headers: { Authorization: `Bearer ${apiKey}` }
});
const presignToken = response.json().presignToken;

// Embed document creation (frontend)
import { unstable_EmbedCreateDocument as EmbedCreateDocument } from "@documenso/embed-react";

<EmbedCreateDocument
  presignToken={presignToken}
  externalId="order-12345"
  onDocumentCreated={(data) => {
    console.log("Document created:", data.documentId);
  }}
/>

// Embed document editing (frontend)
import { unstable_EmbedUpdateDocument as EmbedUpdateDocument } from "@documenso/embed-react";

<EmbedUpdateDocument
  presignToken={presignToken}
  documentId={123}
  onDocumentUpdated={() => {
    console.log("Document updated");
  }}
/>
```

### Presign Tokens

Presign tokens are temporary authentication tokens that:
- Allow embedding without exposing API keys client-side
- Expire after 1 hour (configurable)
- Are generated on backend using API key
- Grant access to authoring features

### Authoring vs. Signing

**Authoring** (this example): For document creators/senders
- Create and edit documents
- Upload PDFs, configure recipients
- Use presign tokens

**Signing** (see other examples): For document recipients
- Sign specific documents
- Use signing tokens

### Resources

- [Authoring Embeds Documentation](https://docs.documenso.com/developers/embedding/authoring)
- [Presign Tokens](https://docs.documenso.com/developers/embedding/authoring#presign-tokens)
