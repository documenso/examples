# Advanced Document Authoring - Documenso Embedding Example

## Documenso Embedding Features Demonstrated

### Advanced Authoring with Templates and Custom Components

This example shows **advanced document authoring** including template creation, custom React components, and dashboard UI patterns.

**Pattern**: Custom component package → Multi-tab interface → Template management → Full document lifecycle

### Key Features

- **`EmbedCreateDocument`**: Create documents
- **`EmbedUpdateDocument`**: Edit documents
- **`EmbedCreateTemplate`**: Create reusable templates
- **`EmbedUpdateTemplate`**: Edit templates
- **Custom Component Package**: Build your own React components wrapping Documenso embeds
- **Dashboard Architecture**: Organize features in tabs (Dashboard, Upload, Preview)
- **Template Management**: Create and reuse templates

### Code Example

```typescript
// Custom component package (packages/react/src/create-document.tsx)
import { unstable_EmbedCreateDocument as EmbedCreateDocument } from "@documenso/embed-react";

export function CreateDocument({ presignToken, externalId, onDocumentCreated }) {
  return (
    <EmbedCreateDocument
      presignToken={presignToken}
      externalId={externalId}
      onDocumentCreated={onDocumentCreated}
    />
  );
}

// Template creation (packages/react/src/create-template.tsx)
import { unstable_EmbedCreateTemplate as EmbedCreateTemplate } from "@documenso/embed-react";

export function CreateTemplate({ presignToken, onTemplateCreated }) {
  return (
    <EmbedCreateTemplate
      presignToken={presignToken}
      onTemplateCreated={(data) => {
        console.log("Template created:", data.templateId);
        onTemplateCreated?.(data);
      }}
    />
  );
}

// Multi-tab dashboard
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

<Tabs>
  <TabsList>
    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
    <TabsTrigger value="upload">Upload</TabsTrigger>
    <TabsTrigger value="preview">Preview</TabsTrigger>
  </TabsList>
  <TabsContent value="dashboard">
    <DocumentDashboard documents={documents} />
  </TabsContent>
  <TabsContent value="upload">
    <DocumentUpload presignToken={presignToken} />
  </TabsContent>
</Tabs>
```

### Advanced Features

**Custom Component Package**:
- Wrap Documenso embeds in your own components
- Add TypeScript types
- Publish to npm for organization-wide use

**Template Management**:
- Create reusable templates
- Update without affecting existing documents
- Configure default recipients and fields

**Dashboard Patterns**:
- View all documents
- Filter by status
- Document statistics
- Quick actions (edit, send, preview)

### Advanced vs. Basic Authoring

**Advanced** (this example):
- Template creation/editing
- Custom component package
- Dashboard UI patterns
- Full document management

**Basic** (see `embed-authoring` example):
- Simple create/update embeds
- Essential features only

### Resources

- [Authoring Embeds Documentation](https://docs.documenso.com/developers/embedding/authoring)
- [Template API](https://docs.documenso.com/developers/public-api/reference)
