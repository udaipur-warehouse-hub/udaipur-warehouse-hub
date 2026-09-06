import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
      <h1 className="text-2xl font-semibold text-copper-dark mb-1">Ganpati Metals</h1>
      <p className="text-muted mb-8 sm:mb-10">Pick where you want to work</p>

      <section className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">
          Retail Counter — everything below is ready to use
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <SegmentCard href="/billing" emoji="🧾" title="New Bill">
            Cash, card or online — with or without a GST bill.
          </SegmentCard>
          <SegmentCard href="/catalog" emoji="📦" title="Item Catalog">
            All your SKUs in one editable sheet. Add new ones any time.
          </SegmentCard>
          <SegmentCard href="/sales" emoji="📜" title="Sales History">
            Every bill raised so far, with invoice numbers.
          </SegmentCard>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">
          Other segments
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <SegmentCard href="/retail-vendors" emoji="🤝" title="Retail Vendors">
            Vendors on credit who settle up weekly — coming next.
          </SegmentCard>
          <SegmentCard href="/credit-vendors" emoji="🏨" title="Credit Vendors">
            Big regular buyers on a fixed payment plan — coming after that.
          </SegmentCard>
        </div>
      </section>
    </div>
  );
}

function SegmentCard({
  href,
  emoji,
  title,
  children,
}: {
  href: string;
  emoji: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-border bg-surface p-5 hover:border-copper hover:shadow-sm transition-all"
    >
      <div className="text-lg font-semibold mb-1">
        {emoji} {title}
      </div>
      <p className="text-sm text-muted">{children}</p>
    </Link>
  );
}
