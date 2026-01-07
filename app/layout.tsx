import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fynd Feedback AI",
  description: "User and Admin dashboards for feedback handling"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-slate-50 text-slate-900">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="text-lg font-semibold">Fynd Feedback AI</div>
                <a
                  href="https://github.com/shivamlth27/Fynd-Feedback-AI"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  GitHub Repo
                </a>
              </div>
              <nav className="flex items-center gap-3 text-sm font-semibold">
                <a className="text-indigo-600 hover:text-indigo-700" href="/">
                  User Dashboard
                </a>
                <span className="text-slate-300">|</span>
                <a className="text-indigo-600 hover:text-indigo-700" href="/admin">
                  Admin Dashboard
                </a>
              </nav>
            </div>
          </header>
          <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
        </main>
      </body>
    </html>
  );
}

