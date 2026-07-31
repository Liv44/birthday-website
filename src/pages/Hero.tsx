import DiscoBall from "@/components/DiscoBall"
import Flower from "@/components/Flower"

const SHIMMER = [
  { left: "6%", top: "12%", delay: "0s", color: "#FA009D" },
  { left: "18%", top: "8%", delay: "0.4s", color: "#FA8100" },
  { left: "82%", top: "10%", delay: "0.2s", color: "#FFC105" },
  { left: "92%", top: "22%", delay: "0.9s", color: "#FA2A00" },
  { left: "10%", top: "38%", delay: "0.6s", color: "#FA755A" },
  { left: "28%", top: "28%", delay: "1.1s", color: "#FA5500" },
  { left: "72%", top: "30%", delay: "0.3s", color: "#FA0007" },
  { left: "88%", top: "42%", delay: "0.7s", color: "#FA009D" },
  { left: "4%", top: "58%", delay: "1.3s", color: "#FA8100" },
  { left: "22%", top: "68%", delay: "0.5s", color: "#FFC105" },
  { left: "48%", top: "52%", delay: "0.8s", color: "#FA2A00" },
  { left: "58%", top: "70%", delay: "1s", color: "#FA755A" },
  { left: "78%", top: "62%", delay: "0.15s", color: "#FA009D" },
  { left: "94%", top: "78%", delay: "1.2s", color: "#FA5500" },
  { left: "14%", top: "86%", delay: "0.55s", color: "#FA8100" },
  { left: "40%", top: "88%", delay: "0.95s", color: "#FFC105" },
  { left: "62%", top: "90%", delay: "0.25s", color: "#FA0007" },
  { left: "34%", top: "18%", delay: "1.4s", color: "#FA755A" },
] as const

type HeroProps = {
  celebrantName: string
}

export default function Hero({ celebrantName }: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl pb-4 pt-2">
      {SHIMMER.map((dot, i) => (
        <div
          key={i}
          className="pointer-events-none absolute size-3 rounded-full pulse-dot"
          style={{
            left: dot.left,
            top: dot.top,
            backgroundColor: dot.color,
            animationDelay: dot.delay,
          }}
        />
      ))}

      <div className="pointer-events-none absolute left-1 top-4">
        <Flower color="#FA009D" size={56} className="float" />
      </div>
      <div className="pointer-events-none absolute right-2 top-6">
        <Flower color="#FA8100" size={48} className="float-delay" />
      </div>
      <div className="pointer-events-none absolute bottom-8 left-2">
        <Flower color="#FFC105" size={52} className="float-delay" />
      </div>
      <div className="pointer-events-none absolute bottom-6 right-1">
        <Flower color="#FA755A" size={50} className="float" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <DiscoBall size={88} />
        <h1 className="gradient-text font-display mt-4 text-4xl font-black tracking-tight sm:text-5xl">
          {celebrantName}
        </h1>
        <p
          className="font-display mt-2 max-w-md text-lg italic sm:text-xl"
          style={{ color: "#FA755A" }}
        >
          Fleurs, disco &amp; 30 bougies — une soirée inoubliable t&apos;attend.
        </p>
      </div>

      <div className="card-glass relative z-10 mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-6 rounded-2xl p-6 sm:grid-cols-3">
        <div className="text-center sm:text-left">
          <div className="text-3xl" aria-hidden>
            📅
          </div>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-brand-magenta">
            Date
          </p>
          <p className="font-display text-xl font-bold text-gray-800">Samedi 12 juillet</p>
          <p className="text-sm text-gray-500">À partir de 18h</p>
        </div>
        <div className="text-center sm:text-left">
          <div className="text-3xl" aria-hidden>
            📍
          </div>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-brand-magenta">
            Lieu
          </p>
          <p className="font-display text-xl font-bold text-gray-800">Le Jardin des Lys</p>
          <p className="text-sm text-gray-500">Paris &amp; alentours</p>
        </div>
        <div className="text-center sm:text-left">
          <div className="text-3xl" aria-hidden>
            ✨
          </div>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-brand-magenta">
            Thème
          </p>
          <p className="font-display text-xl font-bold text-gray-800">Fleurs &amp; Disco</p>
          <p className="text-sm text-gray-500">Paillettes bienvenues</p>
        </div>
      </div>

      {/* <div className="card-glass relative z-10 mx-auto mt-6 max-w-2xl rounded-2xl p-6">
        <h2 className="font-display text-lg font-bold text-gray-800">Mot de la fêtarde</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Merci d&apos;être dans ma vie — j&apos;ai hâte de danser, rire et trinquer avec vous. Tenue
          : couleurs vives, bonne humeur obligatoire.
        </p>
      </div> */}
      <p className="text-center size-3xl font-bold">tu pues du cul</p>

      <div className="relative z-10 mx-auto mt-8 flex flex-col items-center gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Infos pratiques</p>
        <div
          className="flex size-[112px] items-center justify-center rounded-xl border-2 border-dashed font-display text-lg font-black text-brand-magenta"
          style={{
            background: "linear-gradient(135deg, #FFDCCD, #FFC105)",
            borderColor: "#FA009D",
          }}
        >
          QR
        </div>
      </div>
    </section>
  )
}
