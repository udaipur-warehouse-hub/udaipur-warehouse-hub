import Link from "next/link";
import { VendorDetailClient } from "./vendor-detail-client";

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/retail-vendors" className="text-sm text-copper-dark hover:underline mb-4 inline-block">
        ← All vendors
      </Link>
      <VendorDetailClient vendorId={id} />
    </div>
  );
}
