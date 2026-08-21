import { Route, Routes } from "react-router-dom"

import PartyLayout from "./layouts/PartyLayout"
import Guests from "./pages/Guests"
import Planning from "./pages/Planning"
import AddPhotos from "./pages/AddPhotos"
import Gallery from "./pages/Gallery"
import Hero from "./pages/Hero"

export default function App() {
  return (
    <Routes>
      <Route element={<PartyLayout />}>
        <Route index element={<Hero />} />
        <Route path="guests" element={<Guests />} />
        <Route path="planning" element={<Planning />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="add-photos" element={<AddPhotos />} />
      </Route>
    </Routes>
  )
}
