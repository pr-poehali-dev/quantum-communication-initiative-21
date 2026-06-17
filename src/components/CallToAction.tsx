import { useState, useRef } from "react"
import { ArrowRight, CheckCircle, Paperclip, X } from "lucide-react"
import { HighlightedText } from "./HighlightedText"

const SUBMIT_URL = "https://functions.poehali.dev/0b536e5a-dfe3-4f1e-a948-ed0bd5b764ca"

const MAX_FILE_MB = 10
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
]

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} КБ`
    : `${(bytes / 1024 / 1024).toFixed(1)} МБ`
}

export function CallToAction() {
  // --- Форма заявки ---
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
      if (res.ok) setSuccess(true)
      else setError("Что-то пошло не так. Попробуйте ещё раз.")
    } catch {
      setError("Ошибка сети. Проверьте интернет-соединение.")
    } finally {
      setLoading(false)
    }
  }

  // --- Форма письма ---
  const [letter, setLetter] = useState({ name: "", email: "", message: "" })
  const [attachment, setAttachment] = useState<File | null>(null)
  const [letterLoading, setLetterLoading] = useState(false)
  const [letterSuccess, setLetterSuccess] = useState(false)
  const [letterError, setLetterError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLetterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLetter((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setLetterError("")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type)) {
      setLetterError("Допустимые форматы: PDF, Word, Excel, JPG, PNG")
      return
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setLetterError(`Файл слишком большой. Максимум ${MAX_FILE_MB} МБ`)
      return
    }
    setAttachment(file)
    setLetterError("")
  }

  const handleLetterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!letter.name.trim() || !letter.email.trim() || !letter.message.trim()) {
      setLetterError("Заполните все поля")
      return
    }
    setLetterLoading(true)
    try {
      const payload: Record<string, string> = {
        type: "letter",
        name: letter.name,
        email: letter.email,
        message: letter.message,
      }
      if (attachment) {
        payload.attachment = await fileToBase64(attachment)
        payload.attachmentName = attachment.name
      }
      const res = await fetch(SUBMIT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) setLetterSuccess(true)
      else setLetterError("Не удалось отправить письмо. Попробуйте ещё раз.")
    } catch {
      setLetterError("Ошибка сети. Проверьте интернет-соединение.")
    } finally {
      setLetterLoading(false)
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

          {/* Форма заявки */}
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
                  href="tel:+79877521019"
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

          {/* Разделитель */}
          <div className="max-w-xl mx-auto mt-16 mb-12 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-primary-foreground/40 text-xs tracking-widest uppercase">или напишите письмо</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Форма письма */}
          {letterSuccess ? (
            <div className="flex flex-col items-center gap-4 py-8 max-w-xl mx-auto">
              <CheckCircle className="w-12 h-12 text-orange-300" strokeWidth={1.25} />
              <p className="text-lg font-medium">Письмо отправлено!</p>
              <p className="text-primary-foreground/70 text-sm">Мы ответим вам на указанный email в течение рабочего дня.</p>
            </div>
          ) : (
            <form onSubmit={handleLetterSubmit} className="max-w-xl mx-auto flex flex-col gap-4 text-left">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-primary-foreground/60 text-xs tracking-widest uppercase">Имя *</label>
                  <input
                    name="name"
                    value={letter.name}
                    onChange={handleLetterChange}
                    placeholder="Иван Петров"
                    className="bg-white/10 border border-white/20 text-primary-foreground placeholder:text-white/30 px-4 py-3 text-sm outline-none focus:border-white/60 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-primary-foreground/60 text-xs tracking-widest uppercase">Email *</label>
                  <input
                    name="email"
                    type="email"
                    value={letter.email}
                    onChange={handleLetterChange}
                    placeholder="ivan@company.ru"
                    className="bg-white/10 border border-white/20 text-primary-foreground placeholder:text-white/30 px-4 py-3 text-sm outline-none focus:border-white/60 transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-primary-foreground/60 text-xs tracking-widest uppercase">Сообщение *</label>
                <textarea
                  name="message"
                  value={letter.message}
                  onChange={handleLetterChange}
                  rows={4}
                  placeholder="Текст вашего письма..."
                  className="bg-white/10 border border-white/20 text-primary-foreground placeholder:text-white/30 px-4 py-3 text-sm outline-none focus:border-white/60 transition-colors resize-none"
                />
              </div>

              {/* Прикрепить файл */}
              <div className="flex flex-col gap-1.5">
                <label className="text-primary-foreground/60 text-xs tracking-widest uppercase">Документ</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {attachment ? (
                  <div className="flex items-center gap-3 bg-white/10 border border-white/20 px-4 py-3">
                    <Paperclip className="w-4 h-4 text-primary-foreground/60 shrink-0" />
                    <span className="text-sm flex-1 truncate">{attachment.name}</span>
                    <span className="text-xs text-primary-foreground/40 shrink-0">{formatSize(attachment.size)}</span>
                    <button
                      type="button"
                      onClick={() => { setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = "" }}
                      className="text-primary-foreground/40 hover:text-primary-foreground transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 bg-white/5 border border-dashed border-white/20 px-4 py-3 text-sm text-primary-foreground/50 hover:border-white/40 hover:text-primary-foreground/80 transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                    Прикрепить файл (PDF, Word, Excel, JPG — до 10 МБ)
                  </button>
                )}
              </div>

              {letterError && <p className="text-orange-300 text-sm">{letterError}</p>}

              <div className="mt-2">
                <button
                  type="submit"
                  disabled={letterLoading}
                  className="inline-flex items-center justify-center gap-3 bg-primary-foreground text-foreground px-8 py-4 text-sm tracking-wide hover:bg-primary-foreground/90 transition-colors duration-300 group disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {letterLoading ? "Отправляем..." : "Отправить письмо"}
                  {!letterLoading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                </button>
              </div>

              <p className="text-primary-foreground/40 text-xs">
                * Нажимая кнопку, вы соглашаетесь на обработку персональных данных
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
