"use client";

import Link from "next/link";
import { useState } from "react";
import { createRating } from "@/app/actions";
import { StarInput, Stars } from "@/components/Stars";
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
      <div className="rounded border border-white/10 bg-[#211A1F]">
        <div className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-white">Your rating</div>
            {hasRating ? (
              <div className="mt-2 flex items-center gap-3">
                {existingRating?.score === null ? (
                  <span className="text-2xl font-extrabold text-[#8F8288]">NR</span>
                ) : (
                  <>
                    <Stars value={existingRating?.score ?? null} size="text-2xl" />
                    <span className="text-sm font-extrabold text-[#CBBCC2]">{existingRating?.score}.0</span>
                  </>
                )}
              </div>
            ) : (
              <div className="mt-2 text-sm font-semibold text-[#8F8288]">Not rated yet.</div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="rounded bg-[#E58A84] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#2A1110] hover:bg-[#F0A19B]"
          >
            {hasRating ? "Edit" : "Rate drink"}
          </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form action={createRating} onSubmit={() => setIsOpen(false)} className="bg-[#2B2228] p-4">
      <input type="hidden" name="soda_id" value={sodaId} />
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <h2 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-white">Your rating</h2>
        <StarInput defaultValue={existingRating?.score ?? 4} />
      </div>
      <textarea
        name="review_text"
        rows={4}
        defaultValue={existingRating?.review_text || ""}
        placeholder="Add a review"
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
