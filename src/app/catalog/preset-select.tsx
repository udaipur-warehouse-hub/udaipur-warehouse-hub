"use client";

import { useState } from "react";

// A dropdown of common choices with an "Other…" escape hatch that reveals a
// plain text box. Used for Type (material) and Company, which have common
// answers but shouldn't be limited to them.
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
  const [forceCustom, setForceCustom] = useState(false);
  const isCustomValue = value !== "" && !options.includes(value);
  const showCustom = forceCustom || isCustomValue;

  return (
    <div>
      <select
        className={className}
        value={showCustom ? "__other__" : value}
        onChange={(e) => {
          if (e.target.value === "__other__") {
            setForceCustom(true);
            onChange("");
          } else {
            setForceCustom(false);
            onChange(e.target.value);
            onCommit();
          }
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
        <option value="__other__">Other…</option>
      </select>
      {showCustom && (
        <input
          className={`${className} mt-1`}
          placeholder="Type it in"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onCommit}
          autoFocus
        />
      )}
    </div>
  );
}
