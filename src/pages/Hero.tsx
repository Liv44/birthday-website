import DiscoBallPinkGradient from "@/components/assets/disco-balls/DiscoBallPinkGradient";
import DiscoBallYellowGradient from "@/components/assets/disco-balls/DiscoBallYellowGradient";
import FlowerFrontOrangeGradient from "@/components/assets/flowers/FlowerFrontOrangeGradient";
import FlowerFrontPinkGradient from "@/components/assets/flowers/FlowerFrontPinkGradient";
import FlowerFrontYellowGradient from "@/components/assets/flowers/FlowerFrontYellowGradient";
import FlowerSide1RedGradient from "@/components/assets/flowers/FlowerSide1RedGradient";
import FlowerSide1YellowGradient from "@/components/assets/flowers/FlowerSide1YellowGradient";
import Star from "@/components/assets/stars/Star";

export default function Hero() {
  return (
    <div className="relative flex flex-col w-full h-full justify-center items-center">
      <FlowerFrontOrangeGradient className="absolute top-15 -left-25 size-34" />
      <DiscoBallPinkGradient className="hidden lg:block absolute -left-45"/>
      <DiscoBallYellowGradient className="absolute -top-55 z-51" />
      <FlowerFrontPinkGradient className="hidden lg:block absolute -top-10 -right-55" />
      <FlowerFrontYellowGradient className="absolute -bottom-25 -left-45" />
      <FlowerSide1RedGradient className="absolute -bottom-30 -right-25 rotate-200"/>
      <FlowerSide1YellowGradient className="absolute bottom-55 -right-20 rotate-90"/>
      <div className="flex relative max-w-3xl h-full justify-center items-center">
        <Star className="absolute float right-0 top-30"/>
        <Star className="absolute float-delay left-0 bottom-35 size-7" />
        <Star className="absolute float left-25 top-55 size-6"/>
        <Star className="absolute float-delay right-0 bottom-35 size-9"/>
        <h1 className="p-2 gradient-text font-display text-4xl tracking-tight sm:text-8xl">
          Les 25+1 ans d’Olivia
        </h1>
      </div>
      <div className="card-glass relative z-10 mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-6 rounded-2xl p-6 sm:grid-cols-3">
        <div className="text-center min-w-44 sm:text-left">
          <div className="text-3xl" aria-hidden>
            📅
          </div>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-brand-magenta">
            Date
          </p>
          <p className="font-display text-xl font-bold text-gray-800">Samedi 12 juillet</p>
          <p className="text-sm text-gray-500">À partir de 18h</p>
        </div>
        <div className="text-center min-w-44 sm:text-left">
          <div className="text-3xl" aria-hidden>
            📍
          </div>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-brand-magenta">
            Lieu
          </p>
          <p className="font-display text-xl font-bold text-gray-800">Le Jardin des Lys</p>
          <p className="text-sm text-gray-500">Paris &amp; alentours</p>
        </div>
        <div className="text-center min-w-44 sm:text-left">
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
    </div>
  )
}
