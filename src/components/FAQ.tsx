import { useState } from "react"
import { Plus } from "lucide-react"

const faqs = [
  {
    question: "В каких регионах вы работаете?",
    answer:
      "Мы базируемся в Нижнем Новгороде и работаем по всей Нижегородской области и соседним регионам. Выезжаем на объект для оценки и замеров.",
  },
  {
    question: "Сколько времени занимает строительство объекта?",
    answer:
      "Сроки зависят от типа и площади объекта. Строительство частного дома под ключ обычно занимает от 6 до 12 месяцев. Точные сроки мы фиксируем в договоре после составления проекта и сметы.",
  },
  {
    question: "Работаете ли вы по договору и смете?",
    answer:
      "Да, обязательно. Перед началом работ мы заключаем договор, в котором закрепляем стоимость, сроки и объём работ. Смета прозрачная, без скрытых доплат в процессе.",
  },
  {
    question: "Какие виды работ вы выполняете?",
    answer:
      "Мы выполняем полный цикл: монтаж инженерных сетей от наружной части до внутреннего монтажа — водоснабжение, канализация, вентиляция, кондиционирование.",
  },
  {
    question: "Даёте ли вы гарантию на работы?",
    answer:
      "Да. На все выполненные работы мы предоставляем гарантию, прописанную в договоре. При возникновении вопросов в гарантийный период мы оперативно их решаем.",
  },
  {
    question: "Как начать сотрудничество?",
    answer:
      "Оставьте заявку или позвоните нам — мы обсудим вашу задачу, при необходимости выедем на объект, подготовим смету и предложение. После согласования заключаем договор и приступаем к работе.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-20 md:py-29">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-3xl mb-16">
          <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6">Вопросы</p>
          <h2 className="text-6xl font-medium leading-[1.15] tracking-tight mb-6 text-balance lg:text-7xl">
            Частые вопросы
          </h2>
        </div>

        <div>
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-border">
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full py-6 flex items-start justify-between gap-6 text-left group"
              >
                <span className="text-lg font-medium text-foreground transition-colors group-hover:text-foreground/70">
                  {faq.question}
                </span>
                <Plus
                  className={`w-6 h-6 text-foreground flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? "rotate-45" : "rotate-0"
                  }`}
                  strokeWidth={1.5}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="text-muted-foreground leading-relaxed pb-6 pr-12">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}