import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-semibold text-copper-dark mb-1">Ganpati Metals</h1>
      <p className="text-muted mb-10">Shop management — retail counter billing &amp; item catalog</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/billing"
          className="rounded-2xl border border-border bg-surface p-6 hover:border-copper transition-colors"
        >
          <div className="text-xl font-semibold mb-1">🧾 New Bill</div>
          <p className="text-sm text-muted">
            Bill a walk-in customer — cash, card or online, with or without GST.
          </p>
        </Link>

        <Link
          href="/catalog"
          className="rounded-2xl border border-border bg-surface p-6 hover:border-copper transition-colors"
        >
          <div className="text-xl font-semibold mb-1">📦 Item Catalog</div>
          <p className="text-sm text-muted">
            View or add items — new items can also be added while billing.
          </p>
        </Link>

        <Link
          href="/sales"
          className="rounded-2xl border border-border bg-surface p-6 hover:border-copper transition-colors sm:col-span-2"
        >
          <div className="text-xl font-semibold mb-1">📜 Sales History</div>
          <p className="text-sm text-muted">Every bill raised so far, with invoice numbers.</p>
        </Link>
      </div>
    </div>
  );
}
