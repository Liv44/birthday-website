import { Route, Routes } from "react-router-dom"

import { CELEBRANT_FIRST_NAME } from "./constants/party"
import PartyLayout from "./layouts/PartyLayout"
import Animations from "./pages/Animations"
import Guests from "./pages/Guests"
import Hero from "./pages/Hero"
import Planning from "./pages/Planning"
import RSVP from "./pages/RSVP"

export default function App() {
  return (
    <Routes>
      <Route element={<PartyLayout />}>
        <Route index element={<Hero celebrantName={CELEBRANT_FIRST_NAME} />} />
        <Route path="guests" element={<Guests />} />
        <Route path="rsvp" element={<RSVP />} />
        <Route path="animations" element={<Animations />} />
        <Route path="planning" element={<Planning />} />
      </Route>
    </Routes>
  )
}
