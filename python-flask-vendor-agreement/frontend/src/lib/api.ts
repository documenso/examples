export interface AgreementFormData {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  serviceDescription: string;
  pricing: string;
  paymentTerms: string;
  startDate: string;
  duration: string;
}

export interface CreateAgreementResponse {
  success: boolean;
  signingToken: string;
  documentId: string;
}

export interface ApiError {
  error: string;
}

export async function createAgreement(
  data: AgreementFormData
): Promise<CreateAgreementResponse> {
  const response = await fetch("/api/agreement", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error || "Failed to create agreement");
  }

  return response.json();
}
