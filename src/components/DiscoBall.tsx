import type { ReactNode } from "react"

const TILE_COLORS = ["#FA009D", "#FA8100", "#FFC105", "#FA2A00", "#FA5500", "#FA755A", "#FA0007"]

type DiscoBallProps = {
  size?: number
}

export default function DiscoBall({ size = 80 }: DiscoBallProps) {
  const cols = 10
  const rows = 10
  const cellW = 100 / cols
  const cellH = 100 / rows
  const rects: ReactNode[] = []
  let i = 0
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = col * cellW
      const y = row * cellH
      const fill = TILE_COLORS[i % TILE_COLORS.length]
      i += 1
      rects.push(
        <rect
          key={`${row}-${col}`}
          x={x + 0.15}
          y={y + 0.15}
          width={cellW - 0.3}
          height={cellH - 0.3}
          rx={0.8}
          fill={fill}
          opacity={0.92}
        />,
      )
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="spin-slow shrink-0"
      aria-hidden
    >
      <defs>
        <radialGradient id="disco-ball-bg" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FFDCCD" />
          <stop offset="55%" stopColor="#FA755A" />
          <stop offset="100%" stopColor="#FA009D" />
        </radialGradient>
        <clipPath id="disco-ball-circle">
          <circle cx="50" cy="50" r="48" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#disco-ball-bg)" />
      <g clipPath="url(#disco-ball-circle)">{rects}</g>
      <circle
        cx="50"
        cy="50"
        r="48"
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.5"
      />
    </svg>
  )
}
