import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin, logIn } from "@/lib/admin";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

async function login(form: FormData) {
  "use server";
  const r = await logIn(String(form.get("token") ?? ""));
  redirect(r === "ok" ? "/admin" : `/admin/login?e=${r}`);
}

const MESSAGE: Record<string, string> = {
  wrong: "That token isn't right.",
  throttled: "Too many attempts — wait a minute.",
  disabled: "Admin is disabled: set ADMIN_TOKEN on the server.",
};

export default async function Login({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { e } = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4">
      <p className="font-mono text-[11px] tracking-[0.18em] text-accent uppercase">DIV-1 · admin</p>
      <h1 className="mt-2 text-2xl font-medium tracking-tight">Sign in</h1>
      <form action={login} className="mt-6 space-y-3">
        <label className="block">
          <span className="font-mono text-[11px] tracking-[0.15em] text-ink-faint uppercase">Admin token</span>
          <input
            name="token"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            className="mt-1.5 w-full border border-rule bg-surface px-3 py-2 font-mono text-[13px] focus:border-accent focus:outline-none"
          />
        </label>
        {e && MESSAGE[e] ? <p className="font-mono text-[12px] text-accent">{MESSAGE[e]}</p> : null}
        <button
          type="submit"
          className="w-full border border-accent bg-accent px-3 py-2 font-mono text-[12px] tracking-wider text-paper uppercase hover:bg-transparent hover:text-accent"
        >
          sign in
        </button>
      </form>
      <p className="mt-6 font-mono text-[11px] text-ink-faint">The token is ADMIN_TOKEN from your environment.</p>
    </main>
  );
}
