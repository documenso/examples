# Freelance Contract Platform - Documenso Embedding Example

## Documenso Embedding Features Demonstrated

### Multi-Party Signing with `EmbedSignDocument`

This example shows how to embed **multi-party signing workflows** with multiple recipients signing the same document.

**Pattern**: API creates document with multiple recipients → Each recipient gets their own token → Each signs via embedded interface

### Key Features

- **Multi-Recipient Documents**: Create documents with 2+ recipients via API
- **Sequential Signing**: Control signing order with `signingOrder: 0, 1, 2...`
- **Parallel Signing**: Allow any-order signing with `signingOrder: PARALLEL`
- **Recipient-Specific Tokens**: Each signer gets their own unique token
- **Signing Status Tracking**: Monitor which parties have signed
- **Dynamic Token Generation**: Generate tokens on-demand per recipient

### Code Example

```typescript
// Create multi-recipient document (backend)
const response = await fetch(`${host}/api/v1/documents`, {
  method: "POST",
  headers: { Authorization: `Bearer ${apiKey}` },
  body: JSON.stringify({
    title: "Contract",
    recipients: [
      { name: "Client", email: "client@example.com", role: "SIGNER", signingOrder: 0 },
      { name: "Freelancer", email: "freelancer@example.com", role: "SIGNER", signingOrder: 1 }
    ],
    meta: { signingOrder: "SEQUENTIAL" }
  })
});

// Each recipient signs with their own token (frontend)
import { EmbedSignDocument } from "@documenso/embed-react";

<EmbedSignDocument
  token={recipientSigningToken}
  onDocumentCompleted={() => {
    // Check if all parties signed
    if (allPartiesSigned) {
      console.log("Contract fully executed");
    }
  }}
/>
```

### Signing Modes

**Sequential**: Parties must sign in order (freelancer can't sign until client signs)
- Set `signingOrder: 0, 1, 2...` for each recipient
- Set `meta.signingOrder: "SEQUENTIAL"`

**Parallel**: Any party can sign anytime
- All signatures required for completion
- Set `meta.signingOrder: "PARALLEL"`

### Resources

- [Multi-Party Signing API](https://docs.documenso.com/developers/public-api/reference#create-document)
- [EmbedSignDocument API](https://docs.documenso.com/developers/embedding/react)
