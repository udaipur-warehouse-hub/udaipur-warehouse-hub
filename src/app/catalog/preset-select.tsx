"use client";

import { useEffect, useRef, useState } from "react";

// A search-as-you-type combobox for Type and Company: start typing to
// filter the common presets, click one to pick it, or just keep typing
// something new — free text works too, nothing is locked to the list.
export function PresetSelect({
  value,
  options,
  placeholder,
  onChange,
  onCommit,
  className = "cell-input",
}: {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (v: string) => void;
  onCommit: () => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setQuery(value), [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter((o) => o.toLowerCase().includes(query.toLowerCase()));

  function pick(v: string) {
    setQuery(v);
    onChange(v);
    setOpen(false);
    onCommit();
  }

  return (
    <div className="relative" ref={containerRef}>
      <input
        className={className}
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Let a dropdown click register (via onMouseDown below) before
          // treating this as "done editing" and committing the free-text value.
          setTimeout(() => onCommit(), 150);
        }}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-30 left-0 right-0 mt-1 max-h-52 overflow-y-auto rounded-lg border border-border bg-surface shadow-lg text-sm">
          {filtered.map((o) => (
            <button
              key={o}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault(); // fires before the input's onBlur
                pick(o);
              }}
              className="block w-full text-left px-3 py-2 hover:bg-background"
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
