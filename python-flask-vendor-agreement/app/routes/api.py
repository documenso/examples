from flask import Blueprint, jsonify, request

from app.services.documenso import create_signing_document
from app.services.pdf_generator import generate_agreement_pdf

api_bp = Blueprint("api", __name__)


@api_bp.route("/agreement", methods=["POST"])
def create_agreement():
    """
    Create a vendor agreement document.

    Accepts form data, generates a PDF, uploads to Documenso,
    and returns a signing token for the embedded signing view.
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Validate required fields
    required_fields = [
        "companyName",
        "contactName",
        "email",
        "serviceDescription",
        "pricing",
        "paymentTerms",
        "startDate",
        "duration",
    ]

    missing = [field for field in required_fields if not data.get(field)]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    try:
        # Generate PDF from form data
        pdf_bytes = generate_agreement_pdf(data)

        # Create document in Documenso and get signing token
        result = create_signing_document(
            pdf_bytes=pdf_bytes,
            recipient_name=data["contactName"],
            recipient_email=data["email"],
            document_title=f"Vendor Agreement - {data['companyName']}",
        )

        return jsonify(
            {
                "success": True,
                "signingToken": result["signing_token"],
                "documentId": result["document_id"],
            }
        )

    except Exception as e:
        error_msg = str(e)
        # Provide clearer error messages for common issues
        if "Unauthorized" in error_msg or "Invalid token" in error_msg:
            error_msg = (
                "Documenso API authentication failed. Please check your DOCUMENSO_API_KEY in .env"
            )
        elif "DOCUMENSO_API_KEY" in error_msg:
            error_msg = "Documenso API key not configured. Please set DOCUMENSO_API_KEY in .env"
        return jsonify({"error": error_msg}), 500


@api_bp.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "ok"})
