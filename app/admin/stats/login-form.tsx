"use client";

import { useActionState } from "react";
import { login, type LoginState } from "../actions";

const initialState: LoginState = {};

export default function LoginForm({ configured }: { configured: boolean }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    initialState,
  );

  return (
    <div className="w-full max-w-[360px] mx-auto py-10">
      <h1 className="text-xl font-medium text-black dark:text-white mb-2">
        Admin
      </h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
        Enter your password to see the Linktree stats.
      </p>

      {!configured && (
        <p className="text-sm rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 p-3 mb-4">
          <code>ADMIN_PASSWORD</code> isn&apos;t set, so login is disabled. Add
          it in your Netlify environment variables and redeploy.
        </p>
      )}

      <form action={formAction} className="flex flex-col gap-3">
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Password"
          required
          disabled={!configured || pending}
          className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] px-4 py-3 text-[16px] text-black dark:text-white placeholder:text-neutral-500 outline-none focus:border-[#47a3f3] disabled:opacity-50"
        />

        {state.error && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={!configured || pending}
          className="w-full rounded-xl bg-black dark:bg-white text-white dark:text-black font-medium px-4 py-3 min-h-[48px] transition-opacity hover:opacity-85 active:scale-[0.98] disabled:opacity-50"
        >
          {pending ? "Checking…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
