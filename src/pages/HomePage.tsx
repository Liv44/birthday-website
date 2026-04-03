import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <span className="font-medium tracking-tight">Anniversaire</span>
          <nav className="flex gap-4 text-sm text-zinc-400">
            <span className="text-zinc-100">Accueil</span>
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
        <p className="text-sm font-medium uppercase tracking-widest text-amber-400/90">
          Bienvenue
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
          On fête ça ensemble
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-zinc-400">
          Les infos du week-end, le formulaire de réponse et le reste arrivent
          ici. Le projet est branché sur{" "}
          <span className="text-zinc-200">Supabase</span> pour les données.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/"
            className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-amber-400"
          >
            Accueil
          </Link>
        </div>
      </main>
    </div>
  );
}
