"use client";

import { useEffect, useState } from "react";

// A plain controlled number input has a well-known glitch: clear it to type
// a new value, and the moment it's empty the parent snaps it to 0 — so
// typing "100" over a cleared field comes out "0100". This keeps its own
// text buffer and only reports a value up once it's a real number, so
// clearing and retyping behaves the way you'd expect.
export function NumberField({
  value,
  onChange,
  onCommit,
  placeholder,
  className = "input",
  step = "0.01",
  min,
  allowNull = false,
  autoFocus,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  onCommit?: () => void;
  placeholder?: string;
  className?: string;
  step?: string;
  min?: number;
  allowNull?: boolean;
  autoFocus?: boolean;
}) {
  const [text, setText] = useState(value === null || value === undefined ? "" : String(value));

  useEffect(() => {
    setText(value === null || value === undefined ? "" : String(value));
  }, [value]);

  return (
    <input
      type="number"
      step={step}
      min={min}
      autoFocus={autoFocus}
      className={className}
      placeholder={placeholder}
      value={text}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        if (raw === "") return; // stay blank locally; don't touch the real value yet
        const parsed = Number(raw);
        if (!Number.isNaN(parsed)) onChange(parsed);
      }}
      onBlur={() => {
        if (text === "") {
          onChange(allowNull ? null : 0);
          setText(allowNull ? "" : "0");
        }
        onCommit?.();
      }}
    />
  );
}
