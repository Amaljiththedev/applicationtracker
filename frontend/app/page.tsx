"use client";

import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Sign in to Application Tracker
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Continue with your Google account.
        </p>

        <button
          type="button"
          onClick={signInWithGoogle}
          className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-zinc-700 bg-black px-4 text-sm font-semibold text-zinc-100 transition-colors hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.8-5.4 3.8-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.6 3.4 14.5 2.5 12 2.5 6.9 2.5 2.8 6.7 2.8 12s4.1 9.5 9.2 9.5c5.3 0 8.8-3.7 8.8-8.9 0-.6-.1-1-.2-1.4H12z"
            />
            <path
              fill="#34A853"
              d="M3.8 7.6l3.2 2.3c.9-1.9 2.8-3.2 5-3.2 1.8 0 3 .8 3.7 1.4l2.5-2.4C16.6 3.4 14.5 2.5 12 2.5 8.5 2.5 5.5 4.5 3.8 7.6z"
            />
            <path
              fill="#FBBC05"
              d="M12 21.5c2.4 0 4.5-.8 6-2.3l-2.8-2.3c-.8.6-1.8 1-3.2 1-2.2 0-4.1-1.4-4.8-3.4L3.9 17c1.7 3.2 4.8 4.5 8.1 4.5z"
            />
            <path
              fill="#4285F4"
              d="M21 12c0-.6-.1-1-.2-1.4H12v3.9h5.4c-.3 1.3-1.2 2.4-2.2 3.1l2.8 2.3c1.6-1.5 3-3.8 3-7.9z"
            />
          </svg>
          Continue with Google
        </button>
      </div>
    </main>
  );
}
