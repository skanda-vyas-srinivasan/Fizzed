import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";
import { signOut } from "@/app/actions";

export function Nav({ user, profile }: { user: User | null; profile: Profile | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#211A1F]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-white">
          Fizzed
        </Link>
        <nav className="hidden items-center gap-6 text-[13px] font-extrabold uppercase tracking-[0.16em] text-[#CBBCC2] sm:flex">
          <Link className="hover:text-white" href="/">
            Feed
          </Link>
          <Link className="hover:text-white" href="/browse">
            Browse
          </Link>
          <Link className="hover:text-white" href="/log">
            Log
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href={profile?.username ? `/profile/${profile.username}` : "/onboarding"}
                className="hidden rounded bg-[#362B32] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#F8F1F3] hover:bg-[#4A3B43] sm:block"
              >
                {profile?.username || "Set username"}
              </Link>
              <form action={signOut}>
                <button className="rounded bg-[#4A3B43] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#CBBCC2] hover:text-white">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/auth/sign-in"
              className="rounded bg-[#E58A84] px-3 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#2A1110] hover:bg-[#F0A19B]"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
