import { Route, Routes } from "react-router-dom"

import { CELEBRANT_FIRST_NAME } from "./constants/party"
import PartyLayout from "./layouts/PartyLayout"
import Guests from "./pages/Guests"
import Hero from "./pages/Hero"
import Planning from "./pages/Planning"
import AddPhotos from "./pages/AddPhotos"
import Gallery from "./pages/Gallery"
import Home from "./pages/Home"

export default function App() {
  return (
    <Routes>
      <Route element={<PartyLayout />}>
        <Route path="hero" element={<Hero celebrantName={CELEBRANT_FIRST_NAME} />} />
        <Route index element={<Home />} />
        <Route path="guests" element={<Guests />} />
        <Route path="planning" element={<Planning />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="add-photos" element={<AddPhotos />} />
      </Route>
    </Routes>
  )
}
