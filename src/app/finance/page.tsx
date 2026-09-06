import { FinanceClient } from "./finance-client";
import { BackLink } from "@/components/back-link";

// Reads current-month data live — never cache.
export const dynamic = "force-dynamic";

export default function FinancePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <BackLink />
      <FinanceClient />
    </div>
  );
}
