import Link from "next/link";

// A consistent way back to where you came from — every page that isn't
// Home gets one of these up top.
export function BackLink({ href = "/", label = "Home" }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      className="no-print inline-flex items-center gap-1 text-sm text-copper-dark hover:underline mb-4"
    >
      ← {label}
    </Link>
  );
}
