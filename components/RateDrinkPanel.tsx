"use client";

import Link from "next/link";
import { useState } from "react";
import { createRating } from "@/app/actions";
import { StarInput } from "@/components/Stars";
import type { Rating } from "@/lib/types";

export function RateDrinkPanel({ sodaId, isSignedIn, existingRating }: { sodaId: string; isSignedIn: boolean; existingRating?: Rating | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasRating = Boolean(existingRating);

  if (!isSignedIn) {
    return (
      <Link href="/auth/sign-in" className="block bg-[#313035] px-4 py-3 text-center text-[11px] font-extrabold uppercase tracking-[0.12em] text-white hover:bg-[#4A3B43]">
        Sign in to rate drink
      </Link>
    );
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="block w-full bg-[#E58A84] px-4 py-3 text-center text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#2A1110] hover:bg-[#F0A19B]"
      >
        {hasRating ? "Edit rating" : "Rate drink"}
      </button>
    );
  }

  return (
    <form action={createRating} className="bg-[#2B2228] p-4">
      <input type="hidden" name="soda_id" value={sodaId} />
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <h2 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-white">Your rating</h2>
        <StarInput defaultValue={existingRating?.score ?? 4} />
      </div>
      <textarea
        name="review_text"
        rows={4}
        defaultValue={existingRating?.review_text || ""}
        placeholder="Add a tasting note..."
        className="mt-4 w-full resize-none rounded border border-white/10 bg-[#362B32] px-3 py-2 text-sm font-semibold leading-6 text-[#F8F1F3] outline-none placeholder:text-[#927E86] focus:border-[#D9A6B5]"
      />
      <div className="mt-3 flex gap-2">
        <button className="rounded bg-[#E58A84] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.12em] text-[#2A1110]">
          {hasRating ? "Update rating" : "Save rating"}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded bg-[#4A3B43] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.12em] text-[#F8F1F3]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
