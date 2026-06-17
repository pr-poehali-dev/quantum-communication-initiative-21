import { useEffect, useRef, useState } from "react"
import { HighlightedText } from "./HighlightedText"
import { useSiteContent, c } from "@/hooks/useSiteContent"

export function Philosophy() {
  const content = useSiteContent()
  const [visibleItems, setVisibleItems] = useState<number[]>([])
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute("data-index"))
          if (entry.isIntersecting) setVisibleItems((prev) => [...new Set([...prev, index])])
        })
      },
      { threshold: 0.3 },
    )
    itemRefs.current.forEach((ref) => { if (ref) observer.observe(ref) })
    return () => observer.disconnect()
  }, [])

  const items = [
    { title: c(content, "about_item1_title", "Капитальное строительство и реконструкция"), desc: c(content, "about_item1_desc", "") },
    { title: c(content, "about_item2_title", "Инженерные сети полного цикла"), desc: c(content, "about_item2_desc", "") },
    { title: c(content, "about_item3_title", "Команда профессионалов"), desc: c(content, "about_item3_desc", "") },
    { title: c(content, "about_item4_title", "Гарантийное и сервисное обслуживание"), desc: c(content, "about_item4_desc", "") },
  ]

  return (
    <section id="about" className="py-32 md:py-29">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6">
              {c(content, "about_label", "О компании")}
            </p>
            <h2 className="text-6xl md:text-6xl font-medium leading-[1.15] tracking-tight mb-6 text-balance lg:text-8xl">
              Работаем с
              <br />
              <HighlightedText>{c(content, "about_year", "2020 года")}</HighlightedText>
            </h2>
            <div className="relative hidden lg:block">
              <img
                src="https://cdn.poehali.dev/projects/cd4c18b9-9795-44de-9cec-67cabfca1225/files/aa321a45-cc29-4009-b1c7-78fc87f5ab93.jpg"
                alt="Промышленный объект МКМ-НН"
                className="opacity-90 relative z-10 w-full rounded-sm object-cover"
              />
            </div>
          </div>

          <div className="space-y-6 lg:pt-48">
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md mb-12">
              {c(content, "about_description", "")}
            </p>
            {items.map((item, index) => (
              <div
                key={index}
                ref={(el) => { itemRefs.current[index] = el }}
                data-index={index}
                className={`transition-all duration-700 ${visibleItems.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-6">
                  <span className="text-muted-foreground/50 text-sm font-medium">0{index + 1}</span>
                  <div>
                    <h3 className="text-xl font-medium mb-3">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
