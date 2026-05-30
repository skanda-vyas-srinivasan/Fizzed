import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";
import { signOut } from "@/app/actions";

export function Nav({ user, profile }: { user: User | null; profile: Profile | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#150F12]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-white">
          Fizzed
        </Link>
        <nav className="hidden items-center gap-6 text-[13px] font-extrabold uppercase tracking-[0.16em] text-[#B8A7AC] sm:flex">
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
                className="hidden rounded bg-[#2A1E23] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#F4ECEE] hover:bg-[#3A2A31] sm:block"
              >
                {profile?.username || "Set username"}
              </Link>
              <form action={signOut}>
                <button className="rounded bg-[#3A2A31] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#B8A7AC] hover:text-white">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/auth/sign-in"
              className="rounded bg-[#D8423A] px-3 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#180807] hover:bg-[#F05A52]"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
