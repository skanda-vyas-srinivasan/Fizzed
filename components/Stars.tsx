"use client";

import { useState } from "react";

export function Stars({ value, size = "text-base" }: { value: number; size?: string }) {
  return (
    <span className={`inline-flex gap-0.5 ${size}`} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= Math.round(value) ? "text-fizz" : "text-neutral-300"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function StarInput({ name = "score" }: { name?: string }) {
  const [value, setValue] = useState(4);

  return (
    <div className="flex items-center gap-3">
      <input type="hidden" name={name} value={value} />
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setValue(star)}
            className={`text-4xl leading-none transition ${star <= value ? "text-fizz" : "text-neutral-300"}`}
            aria-label={`${star} stars`}
          >
            ★
          </button>
        ))}
      </div>
      <span className="text-sm font-semibold text-neutral-500">{value}.0</span>
    </div>
  );
}
