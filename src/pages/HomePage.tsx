import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export function HomePage() {
  const [supabaseStatus, setSupabaseStatus] = useState<
    "idle" | "ok" | "error"
  >("idle");

  useEffect(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
      setSupabaseStatus("error");
      return;
    }

    const supabase = createClient();
    supabase.auth
      .getSession()
      .then(() => setSupabaseStatus("ok"))
      .catch(() => setSupabaseStatus("error"));
  }, []);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <span className="font-medium tracking-tight">Anniversaire</span>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <span className="text-foreground">Accueil</span>
            <span className="cursor-not-allowed opacity-50" title="Bientôt">
              RSVP
            </span>
            <span className="cursor-not-allowed opacity-50" title="Bientôt">
              Planning
            </span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Bienvenue
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
          On fête ça ensemble
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Les infos du week-end, le formulaire de réponse et le reste arrivent
          ici. Le projet est branché sur Supabase pour les données.
        </p>

        {supabaseStatus === "ok" && (
          <p className="mt-4 text-sm text-muted-foreground">
            Client Supabase prêt (variables{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              VITE_SUPABASE_*
            </code>
            ).
          </p>
        )}
        {supabaseStatus === "error" && (
          <p className="mt-4 text-sm text-destructive">
            Supabase : vérifie{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              .env
            </code>{" "}
            (<code className="rounded bg-muted px-1 py-0.5 text-xs">
              VITE_SUPABASE_URL
            </code>
            ,{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              VITE_SUPABASE_PUBLISHABLE_KEY
            </code>
            ).
          </p>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/" className={cn(buttonVariants())}>
            Accueil
          </Link>
        </div>
      </main>
    </div>
  );
}
