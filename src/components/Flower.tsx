import { cn } from "@/lib/utils"

type FlowerProps = {
  color?: string
  size?: number
  className?: string
}

const ROTATIONS = [0, 60, 120, 180, 240, 300]

export default function Flower({ color = "#FA009D", size = 64, className }: FlowerProps) {
  const cx = 50
  const cy = 50

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <g transform={`translate(${cx} ${cy})`}>
        {ROTATIONS.map((deg) => (
          <ellipse
            key={deg}
            rx="14"
            ry="28"
            fill={color}
            opacity={0.92}
            transform={`rotate(${deg}) translate(0 -18)`}
          />
        ))}
        <circle r="12" fill="#FFC105" />
        <circle r="6" fill="#FA8100" opacity={0.35} />
      </g>
    </svg>
  )
}
