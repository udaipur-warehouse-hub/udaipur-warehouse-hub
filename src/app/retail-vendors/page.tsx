import { VendorListClient } from "./vendor-list-client";
import { BackLink } from "@/components/back-link";

export default function RetailVendorsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <BackLink />
      <VendorListClient />
    </div>
  );
}
