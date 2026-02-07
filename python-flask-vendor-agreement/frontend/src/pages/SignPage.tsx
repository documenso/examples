import { useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { SigningView } from "../components/SigningView";

export function SignPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // Redirect to form if no token
  if (!token) {
    return <Navigate to="/" replace />;
  }

  const handleComplete = () => {
    navigate("/success");
  };

  const handleError = (err: Error) => {
    setError(err.message);
  };

  return (
    <>
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}
      <SigningView
        signingToken={token}
        onComplete={handleComplete}
        onError={handleError}
      />
    </>
  );
}
