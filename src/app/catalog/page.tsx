import { CatalogClient } from "./catalog-client";

export default function CatalogPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Item Catalog</h1>
          <p className="text-sm text-muted">
            Starts empty — add items here, or on the fly while billing.
          </p>
        </div>
      </div>
      <CatalogClient />
    </div>
  );
}
