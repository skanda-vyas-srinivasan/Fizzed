"use client";

import { useState } from "react";

export function Stars({ value, size = "text-base" }: { value: number | null; size?: string }) {
  if (value === null) {
    return <span className={`font-extrabold text-[#8F8288] ${size}`} aria-label="No rating">NR</span>;
  }

  return (
    <span className={`inline-flex gap-0.5 ${size}`} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= Math.round(value) ? "text-[#E58A84]" : "text-[#6B5860]"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function StarInput({ name = "score", defaultValue = 4 }: { name?: string; defaultValue?: number | null }) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="flex items-center gap-3">
      <input type="hidden" name={name} value={value ?? "nr"} />
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        <button
          type="button"
          onClick={() => setValue(null)}
          className={`mr-1 rounded border px-2 py-1 text-sm font-extrabold transition ${value === null ? "border-[#E58A84] bg-[#E58A84] text-[#2A1110]" : "border-white/10 text-[#8F8288] hover:text-white"}`}
          aria-label="No rating"
        >
          NR
        </button>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setValue(star)}
            className={`text-4xl leading-none transition ${value !== null && star <= value ? "text-[#E58A84]" : "text-[#6B5860]"}`}
            aria-label={`${star} stars`}
          >
            ★
          </button>
        ))}
      </div>
      <span className="text-sm font-semibold text-[#CBBCC2]">{value === null ? "NR" : `${value}.0`}</span>
    </div>
  );
}
