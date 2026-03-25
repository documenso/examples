"""
Documenso integration service.

This module handles the complete document signing workflow:
1. Create an envelope (container for the document)
2. Upload the PDF
3. Add recipients (signers)
4. Add signature fields using placeholder-based positioning
5. Distribute the envelope for signing
6. Return the signing token for embedded signing

For more details, see: https://docs.documenso.com/developers/public-api
"""

import os
from typing import Any

from documenso_sdk import Documenso


def get_documenso_client() -> Documenso:
    """Get a configured Documenso SDK client."""
    api_key = os.getenv("DOCUMENSO_API_KEY")
    if not api_key:
        raise ValueError("DOCUMENSO_API_KEY environment variable is required")

    host = os.getenv("DOCUMENSO_HOST", "https://app.documenso.com")
    server_url = f"{host}/api/v2"

    return Documenso(api_key=api_key, server_url=server_url)


def create_signing_document(
    pdf_bytes: bytes,
    recipient_name: str,
    recipient_email: str,
    document_title: str,
) -> dict[str, Any]:
    """
    Create an envelope in Documenso, upload the PDF, and return the signing token.

    This function orchestrates the complete signing workflow using the Envelope API.

    Args:
        pdf_bytes: The PDF file as bytes
        recipient_name: Name of the person who will sign
        recipient_email: Email of the person who will sign
        document_title: Title for the document

    Returns:
        Dictionary with:
            - signing_token: Token for embedded signing
            - document_id: The created envelope ID
    """
    with get_documenso_client() as client:
        # ─────────────────────────────────────────────────────────────────────
        # Step 1: Create the envelope with the PDF file
        # The envelope is a container that holds the document, recipients, and fields
        # ─────────────────────────────────────────────────────────────────────
        create_response = client.envelopes.create(
            payload={
                "title": document_title,
                "type": "DOCUMENT",
                "meta": {
                    "subject": f"Please sign: {document_title}",
                    "message": "Please review and sign this vendor agreement.",
                },
            },
            files=[
                {
                    "file_name": "agreement.pdf",
                    "content": pdf_bytes,
                    "content_type": "application/pdf",
                }
            ],
        )

        envelope_id = create_response.id

        # ─────────────────────────────────────────────────────────────────────
        # Step 2: Add recipients to the envelope
        # Recipients are the people who need to sign. You can have multiple
        # recipients with different signing orders.
        #
        # Roles: SIGNER, VIEWER, CC, APPROVER
        # ─────────────────────────────────────────────────────────────────────
        recipients_response = client.envelopes.recipients.create_many(
            envelope_id=envelope_id,
            data=[
                {
                    "email": recipient_email,
                    "name": recipient_name,
                    "role": "SIGNER",
                    "signing_order": 1,
                }
            ],
        )

        recipient_id = recipients_response.data[0].id

        # ─────────────────────────────────────────────────────────────────────
        # Step 3: Get the envelope item ID (the PDF)
        # Each uploaded file becomes an "envelope item" that we reference
        # when adding fields
        # ─────────────────────────────────────────────────────────────────────
        envelope = client.envelopes.get(envelope_id=envelope_id)
        envelope_item_id = envelope.envelope_items[0].id if envelope.envelope_items else None

        # ─────────────────────────────────────────────────────────────────────
        # Step 4: Add signature and date fields using placeholder-based positioning
        #
        # Placeholder positioning: Documenso scans the PDF for text matching
        # the "placeholder" value (e.g., "[SIGNATURE]") and positions the field
        # at the top-left corner of where that text appears.
        #
        # Field dimensions are specified as percentages of the page size:
        # - width: 35 means 35% of page width
        # - height: 7 means 7% of page height
        #
        # Available field types:
        # - SIGNATURE: Signature field
        # - DATE: Auto-filled date field
        # - TEXT: Free-form text input
        # - EMAIL: Email input
        # - NAME: Name input
        # - INITIALS: Initials field
        # - CHECKBOX: Checkbox
        # ─────────────────────────────────────────────────────────────────────
        host = os.getenv("DOCUMENSO_HOST", "https://app.documenso.com")
        api_key = os.getenv("DOCUMENSO_API_KEY")

        # Field dimensions as percentage of page size
        field_width = 35
        field_height = 7

        # Note: Using SDK's internal httpx client because the SDK models
        # are currently missing the 'type' field for placeholder-based positioning
        http_client = client.sdk_configuration.client
        fields_response = http_client.post(
            f"{host}/api/v2/envelope/field/create-many",
            headers={"Authorization": api_key},
            json={
                "envelopeId": envelope_id,
                "data": [
                    {
                        "type": "SIGNATURE",
                        "recipientId": int(recipient_id),
                        "placeholder": "[SIGNATURE]",
                        "envelopeItemId": envelope_item_id,
                        "width": field_width,
                        "height": field_height,
                    },
                    {
                        "type": "DATE",
                        "recipientId": int(recipient_id),
                        "placeholder": "[DATE]",
                        "envelopeItemId": envelope_item_id,
                        "width": field_width,
                        "height": field_height,
                    },
                ],
            },
        )

        if fields_response.status_code != 200:
            raise ValueError(f"Failed to create fields: {fields_response.text}")

        # ─────────────────────────────────────────────────────────────────────
        # Step 5: Distribute the envelope
        # This "sends" the document for signing. After distribution:
        # - Recipients can sign
        # - The document can no longer be modified
        # - Signing tokens become available
        # ─────────────────────────────────────────────────────────────────────
        client.envelopes.distribute(envelope_id=envelope_id)

        # ─────────────────────────────────────────────────────────────────────
        # Step 6: Get the signing token for embedded signing
        # The token is used with @documenso/react to embed the signing
        # experience directly in your application
        # ─────────────────────────────────────────────────────────────────────
        envelope = client.envelopes.get(envelope_id=envelope_id)

        signing_token = None

        if envelope.recipients:
            for recipient in envelope.recipients:
                if recipient.id == recipient_id:
                    signing_token = recipient.token
                    break

        if not signing_token:
            raise ValueError("Could not retrieve signing token for recipient")

        return {
            "signing_token": signing_token,
            "document_id": envelope_id,
        }
