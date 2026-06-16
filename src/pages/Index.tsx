import { Header } from "../components/Header"
import { Hero } from "../components/Hero"
import { Philosophy } from "../components/Philosophy"
import { Stats } from "../components/Stats"
import { Projects } from "../components/Projects"
import { Expertise } from "../components/Expertise"
import { FAQ } from "../components/FAQ"
import { CallToAction } from "../components/CallToAction"
import { Footer } from "../components/Footer"

export default function Index() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Philosophy />
      <Stats />
      <Projects />
      <Expertise />
      <FAQ />
      <CallToAction />
      <Footer />
    </main>
  )
}