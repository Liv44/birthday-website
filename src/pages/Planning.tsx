import { PLANNING } from "@/data/planning"

export default function Planning() {
  return (
    <div>
      <h2 className="font-display mb-6 text-3xl font-black text-gray-800">Planning</h2>
      <div className="relative pl-8">
      <div
        className="absolute bottom-0 left-[15px] top-0 w-1 rounded-full"
        style={{
          background: "linear-gradient(180deg, #FA009D, #FFC105, #FA8100)",
        }}
        aria-hidden
      />
      <ol className="space-y-6">
        {PLANNING.map((item) => (
          <li key={item.time} className="relative flex gap-4">
            <div
              className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 bg-white text-xl shadow-sm"
              style={{ borderColor: "#FA009D" }}
            >
              <span aria-hidden>{item.icon}</span>
            </div>
            <div className="card-glass min-w-0 flex-1 rounded-2xl px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-magenta">{item.time}</p>
              <p className="mt-1 text-sm font-medium text-gray-800">{item.label}</p>
            </div>
          </li>
        ))}
      </ol>
      </div>
    </div>
  )
}
