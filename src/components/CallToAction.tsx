import { useState } from "react"
import { ArrowRight, CheckCircle } from "lucide-react"
import { HighlightedText } from "./HighlightedText"

const SUBMIT_URL = "https://functions.poehali.dev/0b536e5a-dfe3-4f1e-a948-ed0bd5b764ca"

export function CallToAction() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Пожалуйста, заполните имя и телефон")
      return
    }
    setLoading(true)
    try {
      const res = await fetch(SUBMIT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSuccess(true)
      } else {
        setError("Что-то пошло не так. Попробуйте ещё раз.")
      }
    } catch {
      setError("Ошибка сети. Проверьте интернет-соединение.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="py-32 md:py-29 bg-foreground text-primary-foreground">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-primary-foreground/60 text-sm tracking-[0.3em] uppercase mb-8">Начать проект</p>

          <h2 className="text-3xl md:text-4xl lg:text-6xl font-medium leading-[1.1] tracking-tight mb-8 text-balance">
            Готовы построить
            <br />
            ваш <HighlightedText>объект</HighlightedText>?
          </h2>

          <p className="text-primary-foreground/70 text-lg md:text-xl leading-relaxed mb-12 max-w-2xl mx-auto">
            Оставьте заявку — рассчитаем стоимость и сроки вашего проекта. Бесплатная консультация и выезд на объект.
          </p>

          {success ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <CheckCircle className="w-14 h-14 text-orange-300" strokeWidth={1.25} />
              <p className="text-xl font-medium">Заявка принята!</p>
              <p className="text-primary-foreground/70 max-w-sm">
                Мы свяжемся с вами в ближайшее время. Спасибо за обращение в МКМ-НН.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto flex flex-col gap-4 text-left">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-primary-foreground/60 text-xs tracking-widest uppercase">Имя *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Иван Петров"
                    className="bg-white/10 border border-white/20 text-primary-foreground placeholder:text-white/30 px-4 py-3 text-sm outline-none focus:border-white/60 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-primary-foreground/60 text-xs tracking-widest uppercase">Телефон *</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+7 (900) 000-00-00"
                    className="bg-white/10 border border-white/20 text-primary-foreground placeholder:text-white/30 px-4 py-3 text-sm outline-none focus:border-white/60 transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-primary-foreground/60 text-xs tracking-widest uppercase">Описание задачи</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Расскажите о вашем объекте: тип, площадь, примерные сроки..."
                  className="bg-white/10 border border-white/20 text-primary-foreground placeholder:text-white/30 px-4 py-3 text-sm outline-none focus:border-white/60 transition-colors resize-none"
                />
              </div>

              {error && <p className="text-orange-300 text-sm">{error}</p>}

              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-3 bg-primary-foreground text-foreground px-8 py-4 text-sm tracking-wide hover:bg-primary-foreground/90 transition-colors duration-300 group disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Отправляем..." : "Отправить заявку"}
                  {!loading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                </button>
                <a
                  href="tel:+78312000000"
                  className="inline-flex items-center justify-center gap-2 border border-primary-foreground/30 px-8 py-4 text-sm tracking-wide hover:bg-primary-foreground/10 transition-colors duration-300"
                >
                  Позвонить нам
                </a>
              </div>

              <p className="text-primary-foreground/40 text-xs mt-1">
                * Нажимая кнопку, вы соглашаетесь на обработку персональных данных
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
