"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Profile } from "@/lib/types";

export function ProfilePeopleSearch({ people, empty }: { people: Profile[]; empty: string }) {
  const [query, setQuery] = useState("");
  const filteredPeople = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return people;

    return people.filter((profile) => {
      return [profile.username, profile.bio, profile.location].filter(Boolean).join(" ").toLowerCase().includes(q);
    });
  }, [people, query]);

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="sr-only">Search people</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search username, bio, or location"
          className="w-full rounded border border-white/10 bg-[#362B32] px-4 py-3 text-sm font-semibold text-[#F8F1F3] outline-none placeholder:text-[#927E86] focus:border-[#D9A6B5]"
        />
      </label>

      <section className="rounded border border-white/10 bg-[#211A1F]">
        {filteredPeople.length ? (
          filteredPeople.map((person) => <PersonRow key={person.id} profile={person} />)
        ) : (
          <div className="p-5 text-sm font-semibold text-[#8F8288]">{query.trim() ? "No matching users." : empty}</div>
        )}
      </section>
    </div>
  );
}

function PersonRow({ profile }: { profile: Profile }) {
  const username = profile.username || "Fizzed user";
  return (
    <Link href={`/profile/${username}`} className="flex items-center gap-4 border-b border-white/10 px-5 py-4 last:border-b-0 hover:bg-[#2B2228]">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E9ECEF] text-sm font-black text-[#9AA0A6]">
        {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : username.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0">
        <div className="truncate text-base font-extrabold text-white">@{username}</div>
        {profile.bio ? <div className="mt-1 line-clamp-1 text-sm font-semibold text-[#CBBCC2]">{profile.bio}</div> : null}
        {profile.location ? <div className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8F8288]">{profile.location}</div> : null}
      </div>
    </Link>
  );
}
