import { EmbedSignDocument } from "@documenso/embed-react";

interface SigningViewProps {
  signingToken: string;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export function SigningView({
  signingToken,
  onComplete,
  onError,
}: SigningViewProps) {
  const documensoHost =
    import.meta.env.VITE_DOCUMENSO_HOST || "https://app.documenso.com";

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Sign Your Agreement
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Please review the agreement below and sign to complete.
        </p>
      </div>
      <div className="h-[700px]">
        <EmbedSignDocument
          token={signingToken}
          host={documensoHost}
          className="w-full h-full"
          onDocumentReady={() => {
            console.log("Document ready for signing");
          }}
          onDocumentCompleted={() => {
            console.log("Document signed successfully");
            onComplete();
          }}
          onDocumentError={(error) => {
            console.error("Document error:", error);
            onError(new Error(String(error)));
          }}
        />
      </div>
    </div>
  );
}
