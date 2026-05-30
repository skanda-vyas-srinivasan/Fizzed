import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { getCurrentProfile, getCurrentUser } from "@/lib/data";

export const metadata: Metadata = {
  title: "Fizzed",
  description: "Letterboxd for sodas."
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);

  return (
    <html lang="en">
      <body>
        <Nav user={user} profile={profile} />
        <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">{children}</main>
      </body>
    </html>
  );
}
