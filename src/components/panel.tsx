// A titled section card — the basic building block for a professional,
// segmented screen instead of one undivided wall of controls. Every
// distinct task (search, cart, payment, summary…) gets its own Panel with
// a clear heading, so it's obvious at a glance which part does what.
export function Panel({
  title,
  subtitle,
  actions,
  step,
  children,
  className = "",
  bodyClassName = "p-4 sm:p-5",
}: {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  step?: number;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`rounded-2xl border border-border bg-surface overflow-hidden ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-border bg-background/60">
          <div className="flex items-center gap-2.5 min-w-0">
            {step !== undefined && (
              <span className="shrink-0 h-5 w-5 rounded-full bg-copper text-white text-[11px] font-semibold grid place-items-center">
                {step}
              </span>
            )}
            <div className="min-w-0">
              {title && <h2 className="text-sm font-semibold truncate">{title}</h2>}
              {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
