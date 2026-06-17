import { useState, useEffect, useRef } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

const CDN = "https://cdn.poehali.dev/projects/cd4c18b9-9795-44de-9cec-67cabfca1225/files/"

const projects = [
  {
    id: 1,
    title: "МТС-2, д. Радумля",
    category: "Вентиляция, кондиционирование, водопровод, канализация · 15 000 м²",
    location: "Московская область",
    year: "2023",
    image: CDN + "ce06f91d-5d5c-434c-9fa1-5e8ec0b185ce.jpg",
    gallery: [
      CDN + "ce06f91d-5d5c-434c-9fa1-5e8ec0b185ce.jpg",
      CDN + "9357f7d8-c64a-438b-b273-5ffbd68af559.jpg",
      CDN + "6b765a52-57d4-44e2-b1b5-eca891c19051.jpg",
      CDN + "903ea080-8add-4559-a113-73b7fe66fa75.jpg",
      CDN + "a0ea1a93-9b83-4f93-a04a-364f8c7c6fbd.jpg",
    ],
  },
  {
    id: 2,
    title: "ЖК Космодемьянская",
    category: "Механические системы: вентиляция, охлаждение, отопление, кондиционирование · 9 000 м²",
    location: "Москва",
    year: "2023",
    image: CDN + "e7f66d23-61d3-4940-a2ed-2492ecaaa7c9.jpg",
    gallery: [
      CDN + "e7f66d23-61d3-4940-a2ed-2492ecaaa7c9.jpg",
      CDN + "8eac7c2e-821f-4ebd-8b12-91a51b6d235f.jpg",
      CDN + "ec00a228-57b8-421a-9788-4d74b710570b.jpg",
      CDN + "69142fc5-09a5-499d-a8ba-432ed2130992.jpg",
      CDN + "b58c7077-2dfa-466f-87fd-cedd5c3026d6.jpg",
    ],
  },
  {
    id: 3,
    title: "Склад «Сладкая Жизнь»",
    category: "Отопление, вентиляция, кондиционирование, охлаждение серверных, НВК · 4 500 м²",
    location: "Дзержинск",
    year: "2022",
    image: CDN + "8aa161f4-8462-4eac-a2da-98722be297d2.jpg",
    gallery: [
      CDN + "8aa161f4-8462-4eac-a2da-98722be297d2.jpg",
      CDN + "a94c2916-8fcd-4c27-bc7e-20f101968844.jpg",
      CDN + "188ee39c-2bb3-460a-9896-1728a644df25.jpg",
      CDN + "7b428852-cc4a-4a43-90f5-e213a43dd29e.jpg",
      CDN + "7749219f-f067-45df-bd73-59a9ad3509b8.jpg",
    ],
  },
  {
    id: 4,
    title: "«Сладкая Жизнь»",
    category: "Монтаж сетей водопровода и канализации (НВК) · 12 000 м²",
    location: "Нижний Новгород",
    year: "2022",
    image: CDN + "2cc3416e-f078-43e4-96d7-cfe3b682463c.jpg",
    gallery: [
      CDN + "2cc3416e-f078-43e4-96d7-cfe3b682463c.jpg",
      CDN + "a70aa043-070a-4013-8c17-b5e6aa066d02.jpg",
      CDN + "7a3c2e77-48e4-49e9-a583-eed8b8fd9aed.jpg",
      CDN + "ff66b826-aa12-41de-b589-2bc6424759f8.jpg",
      CDN + "dc49f6ef-b7bd-4cdb-9de7-2bea9ddcace5.jpg",
    ],
  },
  {
    id: 5,
    title: "Мясокомбинат, д. Чернышиха",
    category: "Монтаж сетей водопровода и канализации (НВК) · 200 000 м²",
    location: "Нижегородская область",
    year: "2021",
    image: CDN + "0e296f6b-c511-4eb4-b414-a30688ed777b.jpg",
    gallery: [
      CDN + "0e296f6b-c511-4eb4-b414-a30688ed777b.jpg",
      CDN + "ca4c88a2-8064-4b09-afc6-ef19a0a7df51.jpg",
      CDN + "de6c6e9e-ef09-4e4b-b5dd-6b4af3636a36.jpg",
      CDN + "08c640de-a396-46dc-8b2e-cc8f640dd5b4.jpg",
      CDN + "f099261a-7a9b-443d-b7c1-a68fbd1d0362.jpg",
    ],
  },
  {
    id: 6,
    title: "Завод Coca-Cola",
    category: "Монтаж инженерных сетей ОВиК, монтаж и ПНР",
    location: "Новосибирск",
    year: "2020",
    image: CDN + "4350cd5a-70bd-4e34-b987-2d35fb25d657.jpg",
    gallery: [
      CDN + "4350cd5a-70bd-4e34-b987-2d35fb25d657.jpg",
      CDN + "509d5150-c6cf-4cc0-9815-20dc1b0409e2.jpg",
      CDN + "c82c5588-0f7c-4a7e-a427-3d73a6c4f35a.jpg",
      CDN + "f9377b6f-172b-4c45-a6fb-a007f928ee05.jpg",
      CDN + "a0ea1a93-9b83-4f93-a04a-364f8c7c6fbd.jpg",
    ],
  },
  {
    id: 7,
    title: "ЖК «Filicity»",
    category: "Монтаж инженерных сетей ОВиК, монтаж и ПНР",
    location: "Москва",
    year: "2024",
    image: CDN + "9a2c1d42-10c3-437e-bb1c-5c1593c752e0.jpg",
    gallery: [
      CDN + "9a2c1d42-10c3-437e-bb1c-5c1593c752e0.jpg",
      CDN + "95d62637-5bb0-46c0-b1e5-c219d2fa755e.jpg",
      CDN + "82c44996-d58d-4163-9ae0-870028046b8f.jpg",
      CDN + "0d667e9f-29b6-4362-b0f4-74a5f4425536.jpg",
      CDN + "ec00a228-57b8-421a-9788-4d74b710570b.jpg",
    ],
  },
]

type Project = typeof projects[0]

function GalleryModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") setActiveIndex((i) => (i + 1) % project.gallery.length)
      if (e.key === "ArrowLeft") setActiveIndex((i) => (i - 1 + project.gallery.length) % project.gallery.length)
    }
    document.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [onClose, project.gallery.length])

  const prev = () => setActiveIndex((i) => (i - 1 + project.gallery.length) % project.gallery.length)
  const next = () => setActiveIndex((i) => (i + 1) % project.gallery.length)

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-6 py-4 shrink-0" onClick={(e) => e.stopPropagation()}>
        <div>
          <h3 className="text-white font-medium text-lg">{project.title}</h3>
          <p className="text-white/50 text-sm">{project.location} · {project.year}</p>
        </div>
        <button onClick={onClose} className="text-white/60 hover:text-white transition-colors p-2">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center px-4 min-h-0" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={prev}
          className="absolute left-4 md:left-8 z-10 text-white/60 hover:text-white transition-colors p-2 bg-black/30 hover:bg-black/60 rounded-full"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>

        <img
          key={activeIndex}
          src={project.gallery[activeIndex]}
          alt={`${project.title} — фото ${activeIndex + 1}`}
          className="max-h-full max-w-full object-contain rounded"
          style={{ animation: "fadeIn 0.3s ease" }}
        />

        <button
          onClick={next}
          className="absolute right-4 md:right-8 z-10 text-white/60 hover:text-white transition-colors p-2 bg-black/30 hover:bg-black/60 rounded-full"
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      </div>

      <div className="shrink-0 flex gap-2 justify-center px-6 py-4" onClick={(e) => e.stopPropagation()}>
        {project.gallery.map((img, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`w-14 h-10 rounded overflow-hidden border-2 transition-all ${
              i === activeIndex ? "border-white opacity-100" : "border-transparent opacity-40 hover:opacity-70"
            }`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  )
}

export function Projects() {
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
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
    imageRefs.current.forEach((ref) => { if (ref) observer.observe(ref) })
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <section id="projects" className="py-32 md:py-29 bg-secondary/50">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
            <div>
              <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6">Портфолио</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight">Наши объекты</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {projects.map((project, index) => (
              <article
                key={project.id}
                className="group cursor-pointer"
                onMouseEnter={() => setHoveredId(project.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setSelectedProject(project)}
              >
                <div ref={(el) => (imageRefs.current[index] = el)} className="relative overflow-hidden aspect-[4/3] mb-6">
                  <img
                    src={project.image}
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
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {project.gallery.length} фото
                  </div>
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

      {selectedProject && (
        <GalleryModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </>
  )
}
