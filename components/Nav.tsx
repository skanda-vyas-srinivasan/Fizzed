import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";
import { signOut } from "@/app/actions";

export function Nav({ user, profile }: { user: User | null; profile: Profile | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-black/20 bg-[#211A1F]">
      <div className="border-b border-white/10 bg-[#211A1F]">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-4xl font-extrabold tracking-[-0.04em] text-[#F8F1F3] sm:text-5xl">
            Fizzed
          </Link>
          <form action="/browse" className="hidden h-11 w-full max-w-md items-center rounded-full border border-white/10 bg-[#4A3B43]/70 px-4 sm:flex">
            <input
              name="q"
              placeholder="search sodas, users, brands"
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#F8F1F3] outline-none placeholder:text-[#927E86]"
            />
            <button type="submit" className="ml-3 flex h-7 w-7 items-center justify-center rounded-full text-[#CBBCC2] hover:text-white" aria-label="Search">
              <SearchIcon />
            </button>
          </form>
        </div>
      </div>

      <div className="bg-[#2B2228]">
        <div className="mx-auto grid min-h-12 max-w-7xl grid-cols-1 items-stretch px-4 sm:grid-cols-[1fr_auto] sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
          <div className="hidden lg:block" />
          <nav className="flex min-w-0 items-center justify-center gap-2 overflow-x-auto text-[13px] font-extrabold text-[#CBBCC2] sm:gap-8">
            <Link className="whitespace-nowrap px-1 py-4 hover:text-white" href="/">
              Feed
            </Link>
            <Link className="whitespace-nowrap px-1 py-4 hover:text-white" href="/top">
              Top Sodas
            </Link>
            <Link className="whitespace-nowrap px-1 py-4 hover:text-white" href="/discussion">
              Discussion
            </Link>
          </nav>
          <div className="hidden items-stretch justify-end sm:flex">
            {user ? (
              <div className="flex">
                <Link
                  href={profile?.username ? `/profile/${profile.username}` : "/onboarding"}
                  className="flex items-center bg-[#4A3B43] px-4 text-sm font-extrabold text-[#F8F1F3] hover:bg-[#5A4951]"
                >
                  <span className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#F8F1F3] text-sm font-black text-[#4A3B43]">
                    {(profile?.username || "F").charAt(0).toUpperCase()}
                  </span>
                  {profile?.username || "Set username"}
                </Link>
                <form action={signOut}>
                  <button className="h-full bg-[#3A3037] px-4 text-xs font-extrabold uppercase tracking-[0.12em] text-[#CBBCC2] hover:text-white">
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex">
                <span className="flex items-center bg-[#4A3B43] px-4 text-sm font-extrabold text-[#F8F1F3]">
                  <span className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#F8F1F3] text-sm font-black text-[#4A3B43]">
                    F
                  </span>
                  Guest
                </span>
                <Link
                  href="/auth/sign-in"
                  className="flex items-center bg-[#E58A84] px-4 text-xs font-extrabold uppercase tracking-[0.12em] text-[#2A1110] hover:bg-[#F0A19B]"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <form action="/browse" className="flex border-t border-white/10 bg-[#211A1F] px-4 py-3 sm:hidden">
        <input
          name="q"
          placeholder="search sodas or users"
          className="min-w-0 flex-1 rounded-l bg-[#362B32] px-3 py-2 text-sm font-semibold text-[#F8F1F3] outline-none placeholder:text-[#927E86]"
        />
        <button type="submit" className="rounded-r bg-[#E58A84] px-3 text-[#2A1110]" aria-label="Search">
          <SearchIcon />
        </button>
      </form>
      <div className="flex border-t border-white/10 sm:hidden">
        {user ? (
          <>
            <Link
              href={profile?.username ? `/profile/${profile.username}` : "/onboarding"}
              className="flex flex-1 items-center justify-center bg-[#4A3B43] px-3 py-3 text-sm font-extrabold text-[#F8F1F3]"
            >
              {profile?.username || "Set username"}
            </Link>
            <form action={signOut} className="flex">
              <button className="bg-[#3A3037] px-4 text-xs font-extrabold uppercase tracking-[0.12em] text-[#CBBCC2]">Sign out</button>
            </form>
          </>
        ) : (
          <Link href="/auth/sign-in" className="flex flex-1 items-center justify-center bg-[#E58A84] px-4 py-3 text-xs font-extrabold uppercase tracking-[0.12em] text-[#2A1110]">
              Sign in
          </Link>
        )}
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4.2 4.2" />
    </svg>
  );
}
