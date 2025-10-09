# Documenso Embedding Examples

Real-world examples demonstrating **Documenso's embedding capabilities** for integrating document signing and authoring into your applications.

> **Note**: These examples showcase Documenso embedding features, not application functionality. Focus on understanding how to integrate Documenso's APIs and components.

## Examples

### [Gym Membership Signup](./gym)

**Embedding Feature**: `EmbedSignDocument` with signing tokens

Demonstrates embedding document signing using API-generated signing tokens. Shows single-recipient signing workflow with template-based document generation.

**Key Components**: `EmbedSignDocument`, `/api/v2-beta/template/use`

---

### [SaaS Sales Demo Scheduler](./saas-sales)

**Embedding Feature**: `EmbedDirectTemplate` for instant signing

Demonstrates direct template signing without backend document generation. Shows how to embed signing with pre-filled recipient data and field locking.

**Key Components**: `EmbedDirectTemplate`, direct link templates

---

### [Freelance Contract Platform](./freelance)

**Embedding Feature**: Multi-party signing workflows

Demonstrates multi-recipient signing with sequential and parallel signing orders. Shows how to create documents with 2+ signers and track status for each party.

**Key Components**: `EmbedSignDocument` (multi-recipient), signing orders, recipient-specific tokens

---

### [Document Authoring (Basic)](./embed-authoring)

**Embedding Feature**: Document creation and editing embeds

Demonstrates embedding document authoring interfaces - creating and editing documents directly in your app using presign tokens.

**Key Components**: `EmbedCreateDocument`, `EmbedUpdateDocument`, presign tokens

---

### [Document Authoring (Advanced)](./embed-authoring-advanced)

**Embedding Feature**: Advanced authoring with templates

Demonstrates advanced authoring including template creation, custom React component packages, and multi-tab dashboard architecture.

**Key Components**: `EmbedCreateTemplate`, `EmbedUpdateTemplate`, custom component package, dashboard patterns

---

## Embedding Patterns

| Pattern                 | Component             | Auth Method     | Use Case                   |
| ----------------------- | --------------------- | --------------- | -------------------------- |
| **Signing with Tokens** | `EmbedSignDocument`   | Signing tokens  | Single/multi-party signing |
| **Direct Templates**    | `EmbedDirectTemplate` | Template tokens | Public/instant signing     |
| **Document Creation**   | `EmbedCreateDocument` | Presign tokens  | Let users create documents |
| **Document Editing**    | `EmbedUpdateDocument` | Presign tokens  | Edit draft documents       |
| **Template Creation**   | `EmbedCreateTemplate` | Presign tokens  | Create reusable templates  |
| **Template Editing**    | `EmbedUpdateTemplate` | Presign tokens  | Edit templates             |

## Resources

- [Embedding Documentation](https://docs.documenso.com/developers/embedding)
- [Public API Reference](https://docs.documenso.com/developers/public-api)
- [Direct Links](https://docs.documenso.com/users/direct-links)
- [Templates](https://docs.documenso.com/users/templates)
