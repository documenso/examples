"use client";

import { useState } from "react";
import { BookingForm } from "./booking-form";
import { CalendarConfirmation } from "./calendar-confirmation";
import { NdaSigning } from "./nda-signing";

export type DemoData = {
  name: string;
  email: string;
  company: string;
  role: string;
  phone?: string;
};

export type FlowStep = "booking" | "nda" | "confirmation";

export function DemoScheduler() {
  const [currentStep, setCurrentStep] = useState<FlowStep>("booking");
  const [demoData, setDemoData] = useState<DemoData | null>(null);
  const [signedDocumentId, setSignedDocumentId] = useState<string | null>(null);

  const handleBookingComplete = (data: DemoData) => {
    setDemoData(data);
    setCurrentStep("nda");
  };

  const handleNdaSigned = (documentId: string) => {
    setSignedDocumentId(documentId);
    setCurrentStep("confirmation");
  };

  return (
    <div className="min-h-screen bg-background">
      {currentStep === "booking" && (
        <BookingForm onComplete={handleBookingComplete} />
      )}
      {currentStep === "nda" && demoData && (
        <NdaSigning demoData={demoData} onSigned={handleNdaSigned} />
      )}
      {currentStep === "confirmation" && demoData && (
        <CalendarConfirmation
          demoData={demoData}
          documentId={signedDocumentId}
        />
      )}
    </div>
  );
}
