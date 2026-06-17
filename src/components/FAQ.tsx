import { useState } from "react"
import { Plus } from "lucide-react"
import { useSiteContent, c } from "@/hooks/useSiteContent"

export function FAQ() {
  const content = useSiteContent()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    { question: c(content, "faq_item1_q", "В каких регионах вы работаете?"), answer: c(content, "faq_item1_a", "") },
    { question: c(content, "faq_item2_q", "Сколько времени занимает строительство объекта?"), answer: c(content, "faq_item2_a", "") },
    { question: c(content, "faq_item3_q", "Работаете ли вы по договору и смете?"), answer: c(content, "faq_item3_a", "") },
    { question: c(content, "faq_item4_q", "Какие виды работ вы выполняете?"), answer: c(content, "faq_item4_a", "") },
    { question: c(content, "faq_item5_q", "Даёте ли вы гарантию на работы?"), answer: c(content, "faq_item5_a", "") },
    { question: c(content, "faq_item6_q", "Как начать сотрудничество?"), answer: c(content, "faq_item6_a", "") },
  ]

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
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full py-6 flex items-start justify-between gap-6 text-left group"
              >
                <span className="text-lg font-medium text-foreground transition-colors group-hover:text-foreground/70">
                  {faq.question}
                </span>
                <Plus
                  className={`w-6 h-6 text-foreground flex-shrink-0 transition-transform duration-300 ${openIndex === index ? "rotate-45" : "rotate-0"}`}
                  strokeWidth={1.5}
                />
              </button>
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                <p className="text-muted-foreground leading-relaxed pb-6 pr-12">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
