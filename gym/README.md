# Gym Membership Signup - Documenso Embedding Example

**[🚀 Live Demo](https://documenso-embedding-demo-gym.vercel.app/)**

## Documenso Embedding Features Demonstrated

### `EmbedSignDocument` Component

This example shows how to embed document signing using **signing tokens** generated from templates.

**Pattern**: API generates document → Backend retrieves signing token → Frontend embeds signing interface

### Key Features

- **API Document Generation**: Create documents from templates via `/api/v2-beta/template/use`
- **Signing Tokens**: Backend generates tokens for specific recipients
- **Embedded Signing**: Use `EmbedSignDocument` component to embed signing UI
- **Event Callbacks**: `onDocumentCompleted`, `onDocumentError`, `onDocumentReady`
- **Single Recipient Workflow**: Simple one-party signing

### Code Example

```typescript
// Generate signing token (backend)
const response = await fetch(`${host}/api/v2-beta/template/use`, {
  method: "POST",
  headers: { Authorization: `Bearer ${apiKey}` },
  body: JSON.stringify({ templateId, recipients })
});
const signingToken = response.json().recipients[0].token;

// Embed signing (frontend)
import { EmbedSignDocument } from "@documenso/embed-react";

<EmbedSignDocument
  token={signingToken}
  onDocumentCompleted={() => console.log("Signed!")}
/>
```

### Resources

- [Documenso Embedding Docs](https://docs.documenso.com/developers/embedding)
- [Template API](https://docs.documenso.com/developers/public-api/reference)
