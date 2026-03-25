# SaaS Sales Demo Scheduler - Documenso Embedding Example

🔗 **[Live Demo](https://documenso-embedding-demo-saas-sales.vercel.app/)**

## Documenso Embedding Features Demonstrated

### `EmbedDirectTemplate` Component

This example shows how to embed **direct template signing** without backend document generation.

**Pattern**: Direct template token → Frontend embeds signing interface → Document created on completion

### Key Features

- **Direct Template Embedding**: No API calls needed - instant signing
- **Pre-filled Recipient Data**: Pass name and email to the component
- **Field Locking**: Lock email/name fields with `lockEmail`, `lockName`
- **External ID Tracking**: Associate documents with your app via `externalId`
- **Field-Level Events**: Track `onFieldSigned`, `onFieldUnsigned`

### Code Example

```typescript
import { EmbedDirectTemplate } from "@documenso/embed-react";

<EmbedDirectTemplate
  token={process.env.NEXT_PUBLIC_DOCUMENSO_TEMPLATE_TOKEN}
  name="John Doe"
  email="john@example.com"
  lockEmail={true}
  externalId="demo-12345"
  onDocumentCompleted={(data) => {
    console.log("Document created:", data.documentId);
  }}
  onFieldSigned={() => console.log("Field signed")}
/>
```

### Direct Templates vs. Signing Tokens

**Direct Templates** (this example):
- No backend required
- Document created upon completion
- Template token exposed client-side
- Perfect for public/semi-public signing flows

**Signing Tokens** (see `gym` example):
- Backend controls document creation
- API key never exposed
- More control over document lifecycle

### Resources

- [Direct Links Documentation](https://docs.documenso.com/users/direct-links)
- [EmbedDirectTemplate API](https://docs.documenso.com/developers/embedding/react)
