"""
PDF generation service using WeasyPrint.

This module generates PDFs from HTML/CSS templates using WeasyPrint.
The templates use Jinja2 for variable substitution.

To customize the PDF:
1. Edit the HTML template at app/templates/agreement.html
2. Add new template variables in the context dict below
3. Use standard CSS for styling (WeasyPrint supports most CSS)

For more on WeasyPrint: https://doc.courtbouillon.org/weasyprint/stable/
"""

from datetime import datetime
from pathlib import Path

from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML


def generate_agreement_pdf(data: dict) -> bytes:
    """
    Generate a PDF from the agreement form data.

    The PDF is generated from an HTML template (app/templates/agreement.html)
    using WeasyPrint. The template includes placeholder text like [SIGNATURE]
    and [DATE] that Documenso uses to position signature fields.

    Args:
        data: Dictionary containing form fields:
            - companyName: Vendor company name
            - contactName: Contact person name
            - email: Contact email
            - phone: Contact phone (optional)
            - address: Street address (optional)
            - city: City (optional)
            - state: State (optional)
            - zip: ZIP code (optional)
            - serviceDescription: Description of services
            - pricing: Service pricing/rate
            - paymentTerms: Payment terms (Net 15, Net 30, etc.)
            - startDate: Contract start date
            - duration: Contract duration

    Returns:
        PDF file as bytes
    """
    # Set up Jinja2 template environment
    templates_dir = Path(__file__).parent.parent / "templates"
    env = Environment(loader=FileSystemLoader(templates_dir))
    template = env.get_template("agreement.html")

    # Format the date nicely
    try:
        start_date = datetime.strptime(data.get("startDate", ""), "%Y-%m-%d")
        formatted_date = start_date.strftime("%B %d, %Y")
    except ValueError:
        formatted_date = data.get("startDate", "")

    # ─────────────────────────────────────────────────────────────────────────
    # Template context
    # Add your own variables here and reference them in the HTML template
    # using Jinja2 syntax: {{ variable_name }}
    # ─────────────────────────────────────────────────────────────────────────
    context = {
        "company_name": data.get("companyName", ""),
        "contact_name": data.get("contactName", ""),
        "email": data.get("email", ""),
        "phone": data.get("phone", ""),
        "address": data.get("address", ""),
        "city": data.get("city", ""),
        "state": data.get("state", ""),
        "zip_code": data.get("zip", ""),
        "service_description": data.get("serviceDescription", ""),
        "pricing": data.get("pricing", ""),
        "payment_terms": data.get("paymentTerms", ""),
        "start_date": formatted_date,
        "duration": data.get("duration", ""),
        "generated_date": datetime.now().strftime("%B %d, %Y"),
    }

    # Render HTML template with Jinja2
    html_content = template.render(**context)

    # Convert HTML to PDF using WeasyPrint
    # WeasyPrint supports most CSS including @page rules for margins, headers, etc.
    html = HTML(string=html_content)
    pdf_result = html.write_pdf()

    if pdf_result is None:
        raise RuntimeError("Failed to generate PDF")

    return pdf_result
