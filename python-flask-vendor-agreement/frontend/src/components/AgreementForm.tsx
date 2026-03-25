import { useState } from "react";
import type { AgreementFormData } from "../lib/api";

interface AgreementFormProps {
  onSubmit: (data: AgreementFormData) => Promise<void>;
  isLoading: boolean;
}

const PAYMENT_TERMS = [
  "Net 15",
  "Net 30",
  "Net 45",
  "Net 60",
  "Due on Receipt",
];
const DURATIONS = ["3 months", "6 months", "1 year", "2 years", "Ongoing"];

// Get today's date in YYYY-MM-DD format for the demo
const getTodayDate = () => new Date().toISOString().split("T")[0];

const DEMO_DATA: AgreementFormData = {
  companyName: "Acme Corporation",
  contactName: "Lucas Smith",
  email: "lucas@documenso.com",
  phone: "(555) 123-4567",
  address: "123 Main Street",
  city: "San Francisco",
  state: "CA",
  zip: "94102",
  serviceDescription:
    "Professional software development and consulting services including system architecture design, code review, and technical documentation.",
  pricing: "$5,000/month",
  paymentTerms: "Net 30",
  startDate: getTodayDate(),
  duration: "1 year",
};

export function AgreementForm({ onSubmit, isLoading }: AgreementFormProps) {
  const [formData, setFormData] = useState<AgreementFormData>({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    serviceDescription: "",
    pricing: "",
    paymentTerms: "Net 30",
    startDate: "",
    duration: "1 year",
  });

  const handleFillDemo = () => {
    setFormData({ ...DEMO_DATA, startDate: getTodayDate() });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Demo Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleFillDemo}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Fill with demo data
        </button>
      </div>

      {/* Vendor Information Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Vendor Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="companyName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Company Name *
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              required
              value={formData.companyName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Acme Corporation"
            />
          </div>
          <div>
            <label
              htmlFor="contactName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Contact Name *
            </label>
            <input
              type="text"
              id="contactName"
              name="contactName"
              required
              value={formData.contactName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="John Smith"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="john@acme.com"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        <div className="mt-4">
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Street Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="123 Main Street"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="col-span-2 md:col-span-1">
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="San Francisco"
            />
          </div>
          <div>
            <label
              htmlFor="state"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              State
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="CA"
            />
          </div>
          <div>
            <label
              htmlFor="zip"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ZIP Code
            </label>
            <input
              type="text"
              id="zip"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="94102"
            />
          </div>
        </div>
      </div>

      {/* Service Details Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Service Details
        </h2>
        <div>
          <label
            htmlFor="serviceDescription"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Service Description *
          </label>
          <textarea
            id="serviceDescription"
            name="serviceDescription"
            required
            rows={4}
            value={formData.serviceDescription}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe the services to be provided..."
          />
        </div>
      </div>

      {/* Agreement Terms Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Agreement Terms
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="pricing"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Pricing / Rate *
            </label>
            <input
              type="text"
              id="pricing"
              name="pricing"
              required
              value={formData.pricing}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="$5,000/month"
            />
          </div>
          <div>
            <label
              htmlFor="paymentTerms"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Payment Terms *
            </label>
            <select
              id="paymentTerms"
              name="paymentTerms"
              required
              value={formData.paymentTerms}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {PAYMENT_TERMS.map((term) => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Start Date *
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              required
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Contract Duration *
            </label>
            <select
              id="duration"
              name="duration"
              required
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {DURATIONS.map((duration) => (
                <option key={duration} value={duration}>
                  {duration}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creating Agreement...
            </span>
          ) : (
            "Generate Agreement & Sign"
          )}
        </button>
      </div>
    </form>
  );
}
