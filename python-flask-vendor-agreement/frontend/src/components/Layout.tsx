import { Outlet, useLocation } from "react-router-dom";

export function Layout() {
  const location = useLocation();

  // Determine current step from URL
  const getStep = () => {
    if (location.pathname === "/success") return "success";
    if (location.pathname.startsWith("/sign/")) return "signing";
    return "form";
  };

  const step = getStep();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Vendor Agreement Portal
              </h1>
              <p className="text-sm text-gray-500">
                Complete and sign your service agreement
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <StepIndicator
              number={1}
              label="Fill Form"
              status={
                step === "form"
                  ? "current"
                  : step === "signing" || step === "success"
                    ? "complete"
                    : "pending"
              }
            />
            <div className="w-12 h-px bg-gray-300" />
            <StepIndicator
              number={2}
              label="Sign"
              status={
                step === "signing"
                  ? "current"
                  : step === "success"
                    ? "complete"
                    : "pending"
              }
            />
            <div className="w-12 h-px bg-gray-300" />
            <StepIndicator
              number={3}
              label="Complete"
              status={step === "success" ? "complete" : "pending"}
            />
          </div>
        </div>

        {/* Page content */}
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
          Powered by{" "}
          <a
            href="https://documenso.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Documenso
          </a>
        </div>
      </footer>
    </div>
  );
}

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

function StepIndicator({
  number,
  label,
  status,
}: {
  number: number;
  label: string;
  status: "pending" | "current" | "complete";
}) {
  return (
    <div
      className={`flex items-center gap-2 ${
        status === "current"
          ? "text-blue-600"
          : status === "complete"
            ? "text-green-600"
            : "text-gray-400"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          status === "current"
            ? "bg-blue-600 text-white"
            : status === "complete"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-600"
        }`}
      >
        {status === "complete" ? <CheckIcon /> : number}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
