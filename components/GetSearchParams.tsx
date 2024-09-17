"use client";

import { useSearchParams } from "next/navigation";
import VerificationCodeForm from "./VerificationCodeForm";
import { Suspense } from "react";

// Component to get search params and render the VerificationCodeForm
function GetSearchParams() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const type = searchParams.get("type") || "signup";

  if (!email || !type) {
    return <p>Invalid request. Missing email or type.</p>;
  }

  return <VerificationCodeForm email={email} type={type} />;
}

export default function VerificationCodePage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <GetSearchParams />
    </Suspense>
  );
}
