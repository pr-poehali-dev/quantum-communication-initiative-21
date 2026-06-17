import { useState, useEffect, useRef } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import func2url from "../../backend/func2url.json"

const GET_PHOTOS_URL = (func2url as Record<string, string>)["get-photos"]

const PROJECTS = [
  { id: 1, title: "МТС-2, д. Радумля", category: "Вентиляция, кондиционирование, водопровод, канализация · 15 000 м²", location: "Московская область", year: "2023" },
  { id: 2, title: "ЖК Космодемьянская", category: "Механические системы: вентиляция, охлаждение, отопление, кондиционирование · 9 000 м²", location: "Москва", year: "2023" },
  { id: 3, title: "Склад «Сладкая Жизнь»", category: "Отопление, вентиляция, кондиционирование, охлаждение серверных, НВК · 4 500 м²", location: "Дзержинск", year: "2022" },
  { id: 4, title: "«Сладкая Жизнь»", category: "Монтаж сетей водопровода и канализации (НВК) · 12 000 м²", location: "Нижний Новгород", year: "2022" },
  { id: 5, title: "Мясокомбинат, д. Чернышиха", category: "Монтаж сетей водопровода и канализации (НВК) · 200 000 м²", location: "Нижегородская область", year: "2021" },
  { id: 6, title: "Завод Coca-Cola", category: "Монтаж инженерных сетей ОВиК, монтаж и ПНР", location: "Новосибирск", year: "2020" },
  { id: 7, title: "ЖК «Filicity»", category: "Монтаж инженерных сетей ОВиК, монтаж и ПНР", location: "Москва", year: "2024" },
]

type Photo = { id: number; url: string }
type PhotoMap = Record<string, Photo[]>
type SelectedProject = typeof PROJECTS[0] & { gallery: Photo[] }

function GalleryModal({ project, onClose }: { project: SelectedProject; onClose: () => void }) {
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
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col" onClick={onClose}>
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
        <button onClick={prev} className="absolute left-4 md:left-8 z-10 text-white/60 hover:text-white transition-colors p-2 bg-black/30 hover:bg-black/60 rounded-full">
          <ChevronLeft className="w-7 h-7" />
        </button>
        <img
          key={activeIndex}
          src={project.gallery[activeIndex]?.url}
          alt={`${project.title} — фото ${activeIndex + 1}`}
          className="max-h-full max-w-full object-contain rounded"
          style={{ animation: "fadeIn 0.3s ease" }}
        />
        <button onClick={next} className="absolute right-4 md:right-8 z-10 text-white/60 hover:text-white transition-colors p-2 bg-black/30 hover:bg-black/60 rounded-full">
          <ChevronRight className="w-7 h-7" />
        </button>
      </div>

      <div className="shrink-0 flex gap-2 justify-center px-6 py-4" onClick={(e) => e.stopPropagation()}>
        {project.gallery.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => setActiveIndex(i)}
            className={`w-14 h-10 rounded overflow-hidden border-2 transition-all ${i === activeIndex ? "border-white opacity-100" : "border-transparent opacity-40 hover:opacity-70"}`}
          >
            <img src={photo.url} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  )
}

export function Projects() {
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [selectedProject, setSelectedProject] = useState<SelectedProject | null>(null)
  const [revealedImages, setRevealedImages] = useState<Set<number>>(new Set())
  const [photos, setPhotos] = useState<PhotoMap>({})
  const imageRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    fetch(GET_PHOTOS_URL)
      .then((r) => r.json())
      .then((data) => setPhotos(data.photos || {}))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = imageRefs.current.indexOf(entry.target as HTMLDivElement)
            if (index !== -1) setRevealedImages((prev) => new Set(prev).add(PROJECTS[index].id))
          }
        })
      },
      { threshold: 0.2 },
    )
    imageRefs.current.forEach((ref) => { if (ref) observer.observe(ref) })
    return () => observer.disconnect()
  }, [])

  const openProject = (project: typeof PROJECTS[0]) => {
    const gallery = photos[String(project.id)] || []
    setSelectedProject({ ...project, gallery })
  }

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
            {PROJECTS.map((project, index) => {
              const gallery = photos[String(project.id)] || []
              const cover = gallery[0]?.url
              return (
                <article
                  key={project.id}
                  className="group cursor-pointer"
                  onMouseEnter={() => setHoveredId(project.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => openProject(project)}
                >
                  <div ref={(el) => (imageRefs.current[index] = el)} className="relative overflow-hidden aspect-[4/3] mb-6 bg-secondary">
                    {cover && (
                      <img
                        src={cover}
                        alt={project.title}
                        className={`w-full h-full object-cover transition-transform duration-700 ${hoveredId === project.id ? "scale-105" : "scale-100"}`}
                      />
                    )}
                    <div
                      className="absolute inset-0 bg-primary origin-top"
                      style={{
                        transform: revealedImages.has(project.id) ? "scaleY(0)" : "scaleY(1)",
                        transition: "transform 1.5s cubic-bezier(0.76, 0, 0.24, 1)",
                      }}
                    />
                    {gallery.length > 0 && (
                      <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {gallery.length} фото
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-medium mb-2 group-hover:underline underline-offset-4">{project.title}</h3>
                      <p className="text-muted-foreground text-sm">{project.category} · {project.location}</p>
                    </div>
                    <span className="text-muted-foreground/60 text-sm">{project.year}</span>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {selectedProject && (
        <GalleryModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </>
  )
}
