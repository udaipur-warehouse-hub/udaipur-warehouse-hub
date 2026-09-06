import { VendorDetailClient } from "./vendor-detail-client";
import { BackLink } from "@/components/back-link";

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <BackLink href="/credit-vendors" label="All credit vendors" />
      <VendorDetailClient vendorId={id} />
    </div>
  );
}
