import { BillingClient } from "./billing-client";

export default function BillingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-xl font-semibold mb-6">New Bill — Retail Counter</h1>
      <BillingClient />
    </div>
  );
}
