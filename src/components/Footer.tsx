import { useState, useEffect } from "react"
import { X, MapPin, Banknote, ChevronRight } from "lucide-react"
import func2url from "../../backend/func2url.json"
import { useSiteContent, c } from "@/hooks/useSiteContent"

const MANAGE_URL = (func2url as Record<string, string>)["manage-projects"]

type Vacancy = { id: number; title: string; description: string; salary: string; location: string }

function VacanciesModal({ onClose, email }: { onClose: () => void; email: string }) {
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [expanded, setExpanded] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${MANAGE_URL}?resource=vacancies`)
      .then(r => r.json())
      .then(d => setVacancies(d.vacancies || []))
      .catch(() => {})
      .finally(() => setLoading(false))
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-background w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
          <div>
            <h2 className="text-xl font-medium">Вакансии</h2>
            <p className="text-sm text-muted-foreground mt-0.5">МКМ-НН · Нижний Новгород</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {loading && <div className="py-16 text-center text-muted-foreground text-sm">Загружаю вакансии...</div>}
          {!loading && vacancies.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-lg font-medium mb-2">Открытых вакансий нет</p>
              <p className="text-muted-foreground text-sm">Следите за обновлениями или отправьте резюме на почту</p>
              <a href={`mailto:${email}`} className="inline-block mt-4 text-sm underline underline-offset-4 hover:text-muted-foreground transition-colors">{email}</a>
            </div>
          )}
          <div className="space-y-3">
            {vacancies.map(v => (
              <div key={v.id} className="border border-border">
                <button onClick={() => setExpanded(expanded === v.id ? null : v.id)} className="w-full flex items-start gap-4 p-4 text-left hover:bg-secondary/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{v.title}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                      {v.salary && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Banknote className="w-3 h-3" /> {v.salary}</span>}
                      {v.location && <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" /> {v.location}</span>}
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 mt-0.5 transition-transform ${expanded === v.id ? "rotate-90" : ""}`} />
                </button>
                {expanded === v.id && (
                  <div className="px-4 pb-4 border-t border-border/50 pt-4">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{v.description}</p>
                    <a href={`mailto:${email}?subject=Отклик на вакансию: ${encodeURIComponent(v.title)}`}
                      className="inline-flex items-center gap-2 mt-4 text-sm bg-foreground text-background px-4 py-2 hover:opacity-80 transition-opacity">
                      Откликнуться
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Footer() {
  const content = useSiteContent()
  const [showVacancies, setShowVacancies] = useState(false)

  const phone = c(content, "contacts_phone", "+79877521019")
  const phoneDisplay = c(content, "contacts_phone_display", "+7 (987) 752-10-19")
  const email = c(content, "contacts_email", "info@mkm-nn.ru")
  const telegram = c(content, "contacts_telegram", "#")
  const vk = c(content, "contacts_vk", "#")
  const companyName = c(content, "contacts_company_name", "МКМ-НН")
  const companyDesc = c(content, "contacts_company_desc", "Строительная компания из Нижнего Новгорода.")

  return (
    <>
      <footer className="py-16 md:py-24 border-t border-border">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <a href="/" className="inline-block mb-6">
                <span className="text-foreground text-xl font-semibold tracking-tight">{companyName}</span>
              </a>
              <p className="text-muted-foreground leading-relaxed max-w-sm">{companyDesc}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-4">Компания</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#projects" className="hover:text-foreground transition-colors">Объекты</a></li>
                <li><a href="#about" className="hover:text-foreground transition-colors">О нас</a></li>
                <li><a href="#services" className="hover:text-foreground transition-colors">Виды работ</a></li>
                <li><a href="#contact" className="hover:text-foreground transition-colors">Контакты</a></li>
                <li>
                  <button onClick={() => setShowVacancies(true)} className="hover:text-foreground transition-colors text-left">Вакансии</button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-4">Связь</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href={`mailto:${email}`} className="hover:text-foreground transition-colors">{email}</a></li>
                <li><a href={`tel:${phone}`} className="hover:text-foreground transition-colors">{phoneDisplay}</a></li>
                {telegram !== "#" && <li><a href={telegram} className="hover:text-foreground transition-colors">Телеграм</a></li>}
                {telegram === "#" && <li><span className="opacity-40">Телеграм</span></li>}
                {vk !== "#" && <li><a href={vk} className="hover:text-foreground transition-colors">ВКонтакте</a></li>}
                {vk === "#" && <li><span className="opacity-40">ВКонтакте</span></li>}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2025 {companyName}. Все права защищены.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition-colors">Политика конфиденциальности</a>
              <a href="#" className="hover:text-foreground transition-colors">Условия использования</a>
            </div>
          </div>
        </div>
      </footer>
      {showVacancies && <VacanciesModal onClose={() => setShowVacancies(false)} email={email} />}
    </>
  )
}
