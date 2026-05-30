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
      <head>
        <style dangerouslySetInnerHTML={{ __html: criticalCss }} />
      </head>
      <body>
        <Nav user={user} profile={profile} />
        <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">{children}</main>
      </body>
    </html>
  );
}

const criticalCss = `
  :root { --fizz: #D8423A; --ink: #171717; --cloud: #F5F5F7; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    background: radial-gradient(circle at 20% 0%, rgba(216,66,58,.08), transparent 32rem), linear-gradient(180deg, #fbfbfd 0%, #f5f5f7 42%, #fff 100%);
    color: var(--ink);
    font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  a { color: inherit; text-decoration: none; }
  header {
    position: sticky;
    top: 0;
    z-index: 30;
    border-bottom: 1px solid rgba(0,0,0,.1);
    background: rgba(255,255,255,.8);
    backdrop-filter: blur(24px);
  }
  header > div, main {
    width: 100%;
    max-width: 72rem;
    margin: 0 auto;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
  header > div {
    height: 4rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
  header a:first-child {
    color: var(--fizz);
    font-family: Georgia, "Times New Roman", serif;
    font-size: 1.7rem;
    font-weight: 900;
  }
  nav {
    display: flex;
    align-items: center;
    gap: .25rem;
    border-radius: 999px;
    background: var(--cloud);
    padding: .25rem;
  }
  nav a, header button, header a[href="/auth/sign-in"] {
    border: 0;
    border-radius: 999px;
    padding: .65rem 1rem;
    font-size: .9rem;
    font-weight: 700;
    background: transparent;
  }
  header a[href="/auth/sign-in"], button[class*="bg-fizz"], a[class*="bg-fizz"] {
    background: var(--fizz);
    color: #fff;
  }
  main { padding-top: 1.5rem; padding-bottom: 4rem; }
  h1, h2, .font-display {
    font-family: Georgia, "Times New Roman", serif;
    letter-spacing: 0;
  }
  h1 { font-size: clamp(3rem, 7vw, 5rem); line-height: .98; margin: .5rem 0 1rem; }
  h2 { font-size: 2rem; line-height: 1.05; margin: .35rem 0 1rem; }
  p { line-height: 1.6; }
  section, article, main > div > div[class*="bg-white"], form[class*="space-y"], .ring-1 {
    border-radius: 1.6rem;
  }
  section, article {
    margin-bottom: 1.5rem;
  }
  section:first-child {
    padding: 2rem;
    background: #fff;
    box-shadow: 0 18px 60px rgba(0,0,0,.08);
    border: 1px solid rgba(0,0,0,.06);
  }
  main > div > section:first-child:has(a[href*="category="]) {
    min-height: 430px;
    color: #fff;
    background: radial-gradient(circle at 80% 18%, rgba(216,66,58,.45), transparent 26rem), linear-gradient(135deg, #171717, #262626);
  }
  main > div > section:first-child:has(a[href*="category="]) p { color: rgba(255,255,255,.72); }
  main > div > section:first-child:has(a[href*="category="]) a {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    margin: .25rem;
    padding: .8rem 1rem;
    font-weight: 800;
  }
  main > div > section:first-child:has(a[href*="category="]) a[href="/log"] { background: var(--fizz); color: #fff; }
  main > div > section:first-child:has(a[href*="category="]) a[href="/browse"] { background: #fff; color: #171717; }
  main > div > section:first-child:has(a[href*="category="]) a[href*="category="] {
    border: 1px solid rgba(255,255,255,.16);
    background: rgba(255,255,255,.1);
    color: rgba(255,255,255,.85);
  }
  input, select, textarea {
    border: 1px solid rgba(0,0,0,.12);
    border-radius: 999px;
    background: #fff;
    padding: .8rem 1rem;
    font: inherit;
  }
  textarea { border-radius: 1rem; }
  button {
    border: 0;
    border-radius: 999px;
    padding: .8rem 1rem;
    font: inherit;
    font-weight: 800;
    cursor: pointer;
  }
  main form button, button[type="submit"] { background: var(--fizz); color: #fff; }
  main > div { display: grid; gap: 1.5rem; }
  main > div > section:nth-child(2), main > div > section div[class*="grid"] {
    display: grid;
    gap: 1rem;
  }
  @media (min-width: 760px) {
    main > div > section:nth-child(2) { grid-template-columns: repeat(3, 1fr); }
    main > div > section div[class*="md:grid-cols-2"] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    main > div > section div[class*="lg:grid-cols-4"] { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    main > div > section div[class*="lg:grid-cols-3"] { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }
  article, a[class*="group"], div[class*="ring-1"] {
    background: #fff;
    border: 1px solid rgba(0,0,0,.06);
    box-shadow: 0 8px 30px rgba(0,0,0,.05);
  }
  a[class*="group"] {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    border-radius: 1.6rem;
  }
  span { line-height: 1.3; }
  .text-fizz, span[class*="text-fizz"] { color: var(--fizz); }
  [aria-label*="stars"] span { color: var(--fizz); }
`;
