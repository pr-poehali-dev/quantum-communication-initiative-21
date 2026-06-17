import { useEffect, useRef, useState } from "react"
import { useSiteContent, c } from "@/hooks/useSiteContent"

function useCountUp(target: number, duration = 1800, active = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    let start = 0
    const step = Math.ceil(target / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(start)
    }, 16)
    return () => clearInterval(timer)
  }, [active, target, duration])
  return count
}

function StatItem({ value, suffix, label, active }: { value: number; suffix: string; label: string; active: boolean }) {
  const count = useCountUp(value, 1800, active)
  return (
    <div className="text-center">
      <p className="text-5xl lg:text-6xl font-medium tracking-tight mb-2">
        {count.toLocaleString("ru-RU")}
        <span className="text-orange-400">{suffix}</span>
      </p>
      <p className="text-muted-foreground text-sm uppercase tracking-widest">{label}</p>
    </div>
  )
}

export function Stats() {
  const content = useSiteContent()
  const [active, setActive] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true) },
      { threshold: 0.3 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const stats = [
    { value: Number(c(content, "stats_1_value", "6")), suffix: c(content, "stats_1_suffix", " лет"), label: c(content, "stats_1_label", "на рынке России") },
    { value: Number(c(content, "stats_2_value", "200000")), suffix: c(content, "stats_2_suffix", " м²"), label: c(content, "stats_2_label", "выполненных работ") },
    { value: Number(c(content, "stats_3_value", "7")), suffix: c(content, "stats_3_suffix", "+"), label: c(content, "stats_3_label", "крупных реализованных объектов") },
    { value: Number(c(content, "stats_4_value", "10")), suffix: c(content, "stats_4_suffix", "+"), label: c(content, "stats_4_label", "регионов присутствия") },
  ]

  return (
    <section ref={ref} className="py-24 border-t border-b border-border">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((s) => (
            <StatItem key={s.label} {...s} active={active} />
          ))}
        </div>
      </div>
    </section>
  )
}
