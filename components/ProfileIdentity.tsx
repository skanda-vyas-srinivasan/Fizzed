"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions";
import type { Profile } from "@/lib/types";

export function ProfileIdentity({ profile, editable }: { profile: Profile; editable: boolean }) {
  const [isEditing, setIsEditing] = useState(false);

  if (editable && isEditing) {
    return (
      <form action={updateProfile} className="max-w-2xl space-y-3">
        <InlineField label="Username">
          <input
            name="username"
            required
            minLength={3}
            maxLength={24}
            defaultValue={profile.username || ""}
            className="w-full rounded border border-white/10 bg-[#362B32] px-3 py-2 text-3xl font-extrabold tracking-tight text-white outline-none focus:border-[#D9A6B5] sm:text-4xl"
          />
        </InlineField>
        <InlineField label="Bio">
          <textarea
            name="bio"
            rows={3}
            defaultValue={profile.bio || ""}
            placeholder="Add bio"
            className="w-full resize-none rounded border border-white/10 bg-[#362B32] px-3 py-2 text-sm font-semibold leading-6 text-[#F8F1F3] outline-none placeholder:text-[#927E86] focus:border-[#D9A6B5]"
          />
        </InlineField>
        <InlineField label="Location">
          <input
            name="location"
            defaultValue={profile.location || ""}
            placeholder="Add location"
            className="w-full rounded border border-white/10 bg-[#362B32] px-3 py-2 text-xs font-semibold text-[#CBBCC2] outline-none placeholder:text-[#927E86] focus:border-[#D9A6B5]"
          />
        </InlineField>
        <div className="flex gap-2">
          <button className="rounded bg-[#E58A84] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#2A1110]">Save</button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded bg-[#4A3B43] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#F8F1F3]"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="break-words text-4xl font-extrabold tracking-tight text-white">{profile.username}</h1>
        {editable ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex h-8 w-8 items-center justify-center rounded bg-[#4A3B43] text-[#CBBCC2] hover:bg-[#5A4951] hover:text-white"
            aria-label="Edit profile"
            title="Edit profile"
          >
            <PencilIcon />
          </button>
        ) : null}
      </div>
      {profile.bio ? <p className="mt-4 max-w-prose text-sm font-semibold leading-6 text-[#CBBCC2]">{profile.bio}</p> : null}
      {profile.location ? <p className="mt-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#8F8288]">{profile.location}</p> : null}
    </div>
  );
}

function InlineField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#8F8288]">{label}</span>
      {children}
    </label>
  );
}

function PencilIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
