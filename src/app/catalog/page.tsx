import { Suspense } from "react";
import { CatalogClient } from "./catalog-client";
import { BackLink } from "@/components/back-link";

export default function CatalogPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <BackLink />
      <Suspense>
        <CatalogClient />
      </Suspense>
    </div>
  );
}
