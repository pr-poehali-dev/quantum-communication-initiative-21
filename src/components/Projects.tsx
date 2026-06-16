import { useState, useEffect, useRef } from "react"
import { ArrowUpRight } from "lucide-react"

const projects = [
  {
    id: 1,
    title: "МТС-2, д. Радумля",
    category: "Вентиляция, кондиционирование, водопровод, канализация · 15 000 м²",
    location: "Московская область",
    year: "2023",
    image: "https://cdn.poehali.dev/projects/cd4c18b9-9795-44de-9cec-67cabfca1225/files/ce06f91d-5d5c-434c-9fa1-5e8ec0b185ce.jpg",
  },
  {
    id: 2,
    title: "ЖК Космодемьянская",
    category: "Механические системы: вентиляция, охлаждение, отопление, кондиционирование · 9 000 м²",
    location: "Москва",
    year: "2023",
    image: "https://cdn.poehali.dev/projects/cd4c18b9-9795-44de-9cec-67cabfca1225/files/e7f66d23-61d3-4940-a2ed-2492ecaaa7c9.jpg",
  },
  {
    id: 3,
    title: "Склад «Сладкая Жизнь»",
    category: "Отопление, вентиляция, кондиционирование, охлаждение серверных, НВК · 4 500 м²",
    location: "Дзержинск",
    year: "2022",
    image: "https://cdn.poehali.dev/projects/cd4c18b9-9795-44de-9cec-67cabfca1225/files/8aa161f4-8462-4eac-a2da-98722be297d2.jpg",
  },
  {
    id: 4,
    title: "«Сладкая Жизнь»",
    category: "Монтаж сетей водопровода и канализации (НВК) · 12 000 м²",
    location: "Нижний Новгород",
    year: "2022",
    image: "https://cdn.poehali.dev/projects/cd4c18b9-9795-44de-9cec-67cabfca1225/files/2cc3416e-f078-43e4-96d7-cfe3b682463c.jpg",
  },
  {
    id: 5,
    title: "Мясокомбинат, д. Чернышиха",
    category: "Монтаж сетей водопровода и канализации (НВК) · 200 000 м²",
    location: "Нижегородская область",
    year: "2021",
    image: "https://cdn.poehali.dev/projects/cd4c18b9-9795-44de-9cec-67cabfca1225/files/0e296f6b-c511-4eb4-b414-a30688ed777b.jpg",
  },
  {
    id: 6,
    title: "Завод Coca-Cola",
    category: "Монтаж инженерных сетей ОВиК, монтаж и ПНР",
    location: "Новосибирск",
    year: "2020",
    image: "https://cdn.poehali.dev/projects/cd4c18b9-9795-44de-9cec-67cabfca1225/files/4350cd5a-70bd-4e34-b987-2d35fb25d657.jpg",
  },
  {
    id: 7,
    title: "ЖК «Filicity»",
    category: "Монтаж инженерных сетей ОВиК, монтаж и ПНР",
    location: "Москва",
    year: "2024",
    image: "https://cdn.poehali.dev/projects/cd4c18b9-9795-44de-9cec-67cabfca1225/files/9a2c1d42-10c3-437e-bb1c-5c1593c752e0.jpg",
  },
]

export function Projects() {
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [revealedImages, setRevealedImages] = useState<Set<number>>(new Set())
  const imageRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = imageRefs.current.indexOf(entry.target as HTMLDivElement)
            if (index !== -1) {
              setRevealedImages((prev) => new Set(prev).add(projects[index].id))
            }
          }
        })
      },
      { threshold: 0.2 },
    )

    imageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section id="projects" className="py-32 md:py-29 bg-secondary/50">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6">Портфолио</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight">Наши объекты</h2>
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            Смотреть все проекты
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {projects.map((project, index) => (
            <article
              key={project.id}
              className="group cursor-pointer"
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div ref={(el) => (imageRefs.current[index] = el)} className="relative overflow-hidden aspect-[4/3] mb-6">
                <img
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    hoveredId === project.id ? "scale-105" : "scale-100"
                  }`}
                />
                <div
                  className="absolute inset-0 bg-primary origin-top"
                  style={{
                    transform: revealedImages.has(project.id) ? "scaleY(0)" : "scaleY(1)",
                    transition: "transform 1.5s cubic-bezier(0.76, 0, 0.24, 1)",
                  }}
                />
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-medium mb-2 group-hover:underline underline-offset-4">{project.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {project.category} · {project.location}
                  </p>
                </div>
                <span className="text-muted-foreground/60 text-sm">{project.year}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}