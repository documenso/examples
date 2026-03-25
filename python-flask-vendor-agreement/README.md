# Vendor Agreement Example

A full-stack example demonstrating dynamic PDF generation and embedded document signing with Documenso.

## Overview

This example shows how to:
1. Collect vendor information via a web form
2. Generate a PDF agreement on-the-fly using WeasyPrint
3. Upload the PDF to Documenso using the Envelope API
4. Embed the signing experience directly in your application

## Tech Stack

- **Backend**: Python 3.11+ with Flask
- **Frontend**: React with Vite, React Router, and Tailwind CSS
- **PDF Generation**: WeasyPrint (HTML/CSS to PDF)
- **Document Signing**: Documenso Python SDK + React Embed
- **Tooling**: UV (package manager), Ruff (linter)

## Quick Start

```bash
# Install all dependencies
make install

# Copy and configure environment
cp .env.example .env
# Edit .env and add your DOCUMENSO_API_KEY

# Run in development mode
make dev
```

Open http://localhost:5173 in your browser.

## Prerequisites

### System Dependencies

WeasyPrint requires Pango and GLib for text rendering:

**macOS:**
```bash
brew install pango glib
```

> The Makefile automatically sets `DYLD_FALLBACK_LIBRARY_PATH` to find Homebrew libraries.

**Ubuntu/Debian:**
```bash
apt install libpango-1.0-0 libpangocairo-1.0-0 libglib2.0-0
```

### Documenso API Key

1. Create an account at [Documenso](https://app.documenso.com)
2. Go to Settings > API Tokens
3. Create a new API token

---

## Customization Guide

This section explains the key files you'll want to modify when adapting this example for your own use case.

### 1. PDF Template

**File:** `app/templates/agreement.html`

This is an HTML/CSS template that WeasyPrint converts to PDF. Modify this to change the document layout, content, and styling.

```html
<!-- Key sections to customize -->
<div class="header">
    <h1>Your Document Title</h1>
</div>

<!-- Add your own sections -->
<div class="section">
    <h2 class="section-title">Custom Section</h2>
    <p>{{ your_variable }}</p>
</div>
```

**Placeholder fields for signing:**

The template includes placeholder text that Documenso uses to position signature fields:

```html
<div class="signature-placeholder">
    <span>[SIGNATURE]</span>  <!-- Documenso places signature field here -->
</div>
<div class="signature-placeholder">
    <span>[DATE]</span>       <!-- Documenso places date field here -->
</div>
```

Important: Position placeholders at the top-left corner of where you want the field:
```css
.signature-placeholder span {
    position: absolute;
    top: 0;
    left: 0;
}
```

### 2. PDF Generation Service

**File:** `app/services/pdf_generator.py`

Maps form data to template variables:

```python
def generate_agreement_pdf(form_data: dict) -> bytes:
    template = env.get_template("agreement.html")
    html_content = template.render(
        company_name=form_data.get("companyName"),
        # Add your own fields here
        your_field=form_data.get("yourField"),
    )
    return HTML(string=html_content).write_pdf()
```

### 3. Documenso Integration

**File:** `app/services/documenso.py`

This handles the complete signing workflow:

1. **Create envelope** - Upload PDF to Documenso
2. **Add recipients** - Who needs to sign
3. **Add fields** - Signature, date, text fields, etc.
4. **Distribute** - Send for signing
5. **Get token** - For embedded signing

**Customizing fields:**

```python
# Field dimensions as percentage of page size
field_width = 35   # 35% of page width
field_height = 7   # 7% of page height

# Available field types: SIGNATURE, DATE, TEXT, EMAIL, NAME, INITIALS, CHECKBOX
fields_data = [
    {
        "type": "SIGNATURE",
        "recipientId": recipient_id,
        "placeholder": "[SIGNATURE]",  # Matches text in PDF
        "envelopeItemId": envelope_item_id,
        "width": field_width,
        "height": field_height,
    },
    # Add more fields as needed
]
```

**Adding multiple recipients:**

```python
recipients_response = client.envelopes.recipients.create_many(
    envelope_id=envelope_id,
    data=[
        {"email": "signer1@example.com", "name": "First Signer", "role": "SIGNER", "signing_order": 1},
        {"email": "signer2@example.com", "name": "Second Signer", "role": "SIGNER", "signing_order": 2},
    ],
)
```

### 4. API Endpoint

**File:** `app/routes/api.py`

Modify the request/response schema:

```python
@api.route("/agreement", methods=["POST"])
def create_agreement():
    data = request.get_json()
    
    # Add validation for your fields
    required = ["companyName", "email", "yourRequiredField"]
    
    # Generate PDF and create signing document
    pdf_bytes = generate_agreement_pdf(data)
    result = create_signing_document(...)
    
    return jsonify({"signingToken": result["signing_token"]})
```

### 5. Frontend Form

**File:** `frontend/src/components/AgreementForm.tsx`

Add or modify form fields:

```tsx
// Update the form data interface in frontend/src/lib/api.ts
export interface AgreementFormData {
  companyName: string;
  yourNewField: string;
  // ...
}

// Add form inputs
<input
  type="text"
  name="yourNewField"
  value={formData.yourNewField}
  onChange={handleChange}
/>
```

### 6. Signing View

**File:** `frontend/src/components/SigningView.tsx`

The embedded signing component uses `@documenso/react`:

```tsx
import { EmbedDirectTemplate } from "@documenso/react";

<EmbedDirectTemplate
  token={token}
  host="https://app.documenso.com"
  onDocumentCompleted={() => navigate("/success")}
/>
```

---

## Project Structure

```
vendor-agreement/
├── app/
│   ├── main.py                  # Flask app entry point
│   ├── routes/
│   │   └── api.py               # API endpoints
│   ├── services/
│   │   ├── documenso.py         # Documenso SDK integration
│   │   └── pdf_generator.py     # WeasyPrint PDF generation
│   └── templates/
│       └── agreement.html       # PDF template (HTML/CSS)
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Router setup
│   │   ├── components/
│   │   │   ├── AgreementForm.tsx
│   │   │   ├── SigningView.tsx
│   │   │   ├── SuccessView.tsx
│   │   │   └── Layout.tsx
│   │   ├── pages/
│   │   │   ├── FormPage.tsx
│   │   │   ├── SignPage.tsx
│   │   │   └── SuccessPage.tsx
│   │   └── lib/
│   │       └── api.ts           # API client & types
│   └── vite.config.ts           # Proxy config
├── Makefile
├── pyproject.toml
└── .env.example
```

## API Reference

### POST /api/agreement

Creates a vendor agreement, generates a PDF, and returns a signing token.

**Request:**
```json
{
  "companyName": "Acme Corp",
  "contactName": "John Smith",
  "email": "john@acme.com",
  "serviceDescription": "Software development services...",
  "pricing": "$10,000/month",
  "paymentTerms": "Net 30",
  "startDate": "2025-03-01",
  "duration": "1 year"
}
```

**Response:**
```json
{
  "success": true,
  "signingToken": "abc123...",
  "documentId": "envelope_xyz..."
}
```

## Frontend Routes

| Route | Description |
|-------|-------------|
| `/` | Agreement form |
| `/sign/:token` | Embedded signing view |
| `/success` | Completion confirmation |

## How It Works

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Fill Form  │────>│ Generate    │────>│  Upload to  │────>│   Embed     │
│     (/)     │     │    PDF      │     │  Documenso  │     │   Signing   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                          │                    │                    │
                    WeasyPrint           Envelope API         React Embed
                    HTML → PDF           + Fields API         @documenso/react
```

1. User fills out the form at `/`
2. Backend generates PDF from HTML template using WeasyPrint
3. PDF is uploaded to Documenso via Envelope API
4. Signature/date fields are positioned using placeholder text matching
5. Document is distributed for signing
6. Frontend embeds the signing experience at `/sign/:token`
7. User signs and is redirected to `/success`

## Make Commands

| Command | Description |
|---------|-------------|
| `make install` | Install all dependencies |
| `make dev` | Run backend + frontend |
| `make backend` | Run Flask only (port 5001) |
| `make frontend` | Run Vite only (port 5173) |
| `make build` | Build frontend for production |
| `make prod` | Build and serve production |
| `make lint` | Run linters |
| `make format` | Format Python code |
| `make clean` | Remove build artifacts |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DOCUMENSO_API_KEY` | Yes | - | Your Documenso API token |
| `DOCUMENSO_HOST` | No | `https://app.documenso.com` | Documenso instance URL |
| `FLASK_DEBUG` | No | `0` | Enable Flask debug mode |

## Related Documentation

- [Documenso API Documentation](https://docs.documenso.com/developers/public-api)
- [Documenso Embedding Guide](https://docs.documenso.com/developers/embedding)
- [WeasyPrint Documentation](https://doc.courtbouillon.org/weasyprint/stable/)
- [Documenso Python SDK](https://pypi.org/project/documenso-sdk/)
