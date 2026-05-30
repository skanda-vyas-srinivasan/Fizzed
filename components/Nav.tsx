import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";
import { signOut } from "@/app/actions";

export function Nav({ user, profile }: { user: User | null; profile: Profile | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-white/75 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-display text-[1.7rem] font-black tracking-normal text-fizz">
          Fizzed
        </Link>
        <nav className="hidden items-center gap-1 rounded-full bg-cloud p-1 text-sm font-medium text-neutral-600 sm:flex">
          <Link className="rounded-full px-4 py-2 hover:bg-white hover:text-ink" href="/">
            Feed
          </Link>
          <Link className="rounded-full px-4 py-2 hover:bg-white hover:text-ink" href="/browse">
            Browse
          </Link>
          <Link className="rounded-full px-4 py-2 hover:bg-white hover:text-ink" href="/log">
            Log
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href={profile?.username ? `/profile/${profile.username}` : "/onboarding"}
                className="hidden rounded-full px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-cloud sm:block"
              >
                {profile?.username || "Set username"}
              </Link>
              <form action={signOut}>
                <button className="rounded-full border border-black/10 px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-white">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/auth/sign-in"
              className="rounded-full bg-fizz px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-red-500/20"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
