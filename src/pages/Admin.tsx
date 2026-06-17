import { useState, useRef, useEffect, useCallback } from "react"
import func2url from "../../backend/func2url.json"
import Icon from "@/components/ui/icon"

const UPLOAD_URL = (func2url as Record<string, string>)["upload-photo"]
const GET_PHOTOS_URL = (func2url as Record<string, string>)["get-photos"]
const REORDER_URL = (func2url as Record<string, string>)["reorder-photos"]
const MANAGE_URL = (func2url as Record<string, string>)["manage-projects"]
const ADMIN_PASSWORD = "mkm2024admin"

type Project = { id: number; title: string; category: string; location: string; year: string }
type Photo = { id: number; url: string }
type PhotoMap = Record<string, Photo[]>
type Screen = "projects" | "photos" | "edit" | "new"
type Lead = { id: number; name: string; phone: string; message: string | null; created_at: string; read: boolean }

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export default function Admin() {
  const [password, setPassword] = useState("")
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState("")
  const [tab, setTab] = useState<"portfolio" | "leads">("portfolio")
  const [screen, setScreen] = useState<Screen>("projects")
  const [projects, setProjects] = useState<Project[]>([])
  const [photos, setPhotos] = useState<PhotoMap>({})
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [currentPhotos, setCurrentPhotos] = useState<Photo[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dragOverUpload, setDragOverUpload] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const [form, setForm] = useState({ title: "", category: "", location: "", year: "" })
  const [leads, setLeads] = useState<Lead[]>([])
  const [leadsLoading, setLeadsLoading] = useState(false)
  const [expandedLead, setExpandedLead] = useState<number | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const loadAll = () => {
    fetch(MANAGE_URL).then(r => r.json()).then(d => setProjects(d.projects || [])).catch(() => {})
    fetch(GET_PHOTOS_URL).then(r => r.json()).then(d => setPhotos(d.photos || {})).catch(() => {})
  }

  const loadUnreadCount = useCallback(() => {
    fetch(`${MANAGE_URL}?resource=leads_count&password=${encodeURIComponent(ADMIN_PASSWORD)}`)
      .then(r => r.json())
      .then(d => setUnreadCount(d.unread || 0))
      .catch(() => {})
  }, [])

  const loadLeads = () => {
    setLeadsLoading(true)
    fetch(`${MANAGE_URL}?resource=leads&password=${encodeURIComponent(ADMIN_PASSWORD)}`)
      .then(r => r.json())
      .then(d => {
        setLeads(d.leads || [])
        setUnreadCount(0) // все прочитаны после открытия вкладки
      })
      .catch(() => {})
      .finally(() => setLeadsLoading(false))
  }

  useEffect(() => {
    if (authed) {
      loadAll()
      loadUnreadCount()
    }
  }, [authed, loadUnreadCount])

  // Опрашиваем счётчик каждые 30 секунд
  useEffect(() => {
    if (!authed) return
    const interval = setInterval(loadUnreadCount, 30_000)
    return () => clearInterval(interval)
  }, [authed, loadUnreadCount])

  // Загружаем заявки при переключении на вкладку
  useEffect(() => {
    if (authed && tab === "leads") loadLeads()
  }, [tab, authed])

  useEffect(() => {
    if (selectedProject) setCurrentPhotos(photos[String(selectedProject.id)] || [])
  }, [selectedProject, photos])

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) { setAuthed(true); setAuthError("") }
    else setAuthError("Неверный пароль")
  }

  const openPhotos = (p: Project) => { setSelectedProject(p); setScreen("photos") }
  const openEdit = (p: Project) => {
    setSelectedProject(p)
    setForm({ title: p.title, category: p.category, location: p.location, year: p.year })
    setScreen("edit")
  }
  const openNew = () => {
    setForm({ title: "", category: "", location: "", year: new Date().getFullYear().toString() })
    setScreen("new")
  }

  const handleSaveProject = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    if (screen === "edit" && selectedProject) {
      await fetch(MANAGE_URL, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: ADMIN_PASSWORD, id: selectedProject.id, ...form }) })
    } else {
      await fetch(MANAGE_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: ADMIN_PASSWORD, ...form }) })
    }
    setSaving(false)
    loadAll()
    setScreen("projects")
  }

  const handleDeleteProject = async (p: Project) => {
    if (!confirm(`Удалить объект «${p.title}» и все его фото?`)) return
    await fetch(MANAGE_URL, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: ADMIN_PASSWORD, id: p.id }) })
    loadAll()
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || !selectedProject) return
    setUploading(true)
    for (const file of Array.from(files)) {
      const base64 = await fileToBase64(file)
      await fetch(UPLOAD_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: ADMIN_PASSWORD, image: base64, contentType: file.type, projectId: selectedProject.id }) })
    }
    setUploading(false)
    loadAll()
  }

  const handleDeletePhoto = async (photoId: number) => {
    await fetch(UPLOAD_URL, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: ADMIN_PASSWORD, id: photoId }) })
    loadAll()
  }

  const handleSaveOrder = async () => {
    setSaving(true)
    await fetch(REORDER_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: ADMIN_PASSWORD, ids: currentPhotos.map(p => p.id) }) })
    setSaving(false)
    loadAll()
  }

  const onDragStart = (i: number) => setDragIndex(i)
  const onDragEnter = (i: number) => setDropIndex(i)
  const onDragEnd = () => {
    if (dragIndex !== null && dropIndex !== null && dragIndex !== dropIndex) {
      const updated = [...currentPhotos]
      const [moved] = updated.splice(dragIndex, 1)
      updated.splice(dropIndex, 0, moved)
      setCurrentPhotos(updated)
    }
    setDragIndex(null)
    setDropIndex(null)
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-medium mb-8 text-center">Вход в панель управления</h1>
          <div className="space-y-4">
            <input type="password" placeholder="Пароль" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              className="w-full border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors bg-background"
            />
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button onClick={handleLogin} className="w-full bg-foreground text-background py-3 text-sm font-medium hover:opacity-80 transition-opacity">
              Войти
            </button>
          </div>
        </div>
      </div>
    )
  }

  const savedOrder = photos[String(selectedProject?.id)] || []
  const orderChanged = JSON.stringify(currentPhotos.map(p => p.id)) !== JSON.stringify(savedOrder.map(p => p.id))
  const isPortfolioSubscreen = screen !== "projects" && tab === "portfolio"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center gap-4">
        {isPortfolioSubscreen && (
          <button onClick={() => setScreen("projects")} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="ArrowLeft" size={18} />
          </button>
        )}
        <h1 className="text-lg font-medium flex-1">
          {tab === "leads" && "Заявки с сайта"}
          {tab === "portfolio" && screen === "projects" && "Управление портфолио"}
          {tab === "portfolio" && screen === "photos" && `Фото: ${selectedProject?.title}`}
          {tab === "portfolio" && screen === "edit" && `Редактировать: ${selectedProject?.title}`}
          {tab === "portfolio" && screen === "new" && "Новый объект"}
        </h1>
        <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← На сайт</a>
      </div>

      {/* Tabs */}
      {!isPortfolioSubscreen && (
        <div className="border-b border-border px-6 flex">
          <button
            onClick={() => { setTab("portfolio"); setScreen("projects") }}
            className={`px-5 py-3 text-sm border-b-2 transition-colors ${tab === "portfolio" ? "border-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Портфолио
          </button>
          <button
            onClick={() => setTab("leads")}
            className={`px-5 py-3 text-sm border-b-2 transition-colors flex items-center gap-2 ${tab === "leads" ? "border-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Заявки
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center leading-none font-medium">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* === ЗАЯВКИ === */}
        {tab === "leads" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Всего заявок: {leads.length}
                {leads.filter(l => !l.read).length > 0 && (
                  <span className="ml-2 text-red-500 font-medium">
                    · {leads.filter(l => !l.read).length} новых
                  </span>
                )}
              </p>
              <button onClick={loadLeads} disabled={leadsLoading}
                className="text-xs px-3 py-1.5 border border-border hover:border-foreground transition-colors flex items-center gap-1.5 disabled:opacity-50">
                <Icon name="RefreshCw" size={12} />
                {leadsLoading ? "Загружаю..." : "Обновить"}
              </button>
            </div>

            {leads.length === 0 && !leadsLoading && (
              <div className="text-center py-16 text-muted-foreground">
                <Icon name="Inbox" size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Заявок пока нет</p>
              </div>
            )}

            <div className="space-y-2">
              {leads.map(lead => (
                <div key={lead.id} className={`border transition-colors ${!lead.read ? "border-foreground/30 bg-secondary/40" : "border-border"}`}>
                  <button
                    onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-secondary/50 transition-colors"
                  >
                    {/* Индикатор нового */}
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      {!lead.read && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm ${!lead.read ? "font-semibold" : "font-medium"}`}>{lead.name}</p>
                        {!lead.read && (
                          <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wide leading-none">Новая</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{lead.phone}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">{formatDate(lead.created_at)}</p>
                      {lead.message && (
                        <p className="text-xs text-muted-foreground/60 mt-0.5 max-w-[160px] truncate">{lead.message}</p>
                      )}
                    </div>
                    <Icon name={expandedLead === lead.id ? "ChevronUp" : "ChevronDown"} size={14} className="text-muted-foreground shrink-0" />
                  </button>

                  {expandedLead === lead.id && (
                    <div className="px-4 pb-4 border-t border-border/50 pt-4">
                      <div className="grid sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Имя</p>
                          <p className="text-sm">{lead.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Телефон</p>
                          <a href={`tel:${lead.phone}`} className="text-sm hover:underline">{lead.phone}</a>
                        </div>
                      </div>
                      {lead.message && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Сообщение</p>
                          <p className="text-sm whitespace-pre-wrap bg-secondary/50 p-3 rounded">{lead.message}</p>
                        </div>
                      )}
                      <div className="mt-4">
                        <a href={`tel:${lead.phone}`}
                          className="text-xs px-3 py-1.5 bg-foreground text-background hover:opacity-80 transition-opacity flex items-center gap-1.5 inline-flex">
                          <Icon name="Phone" size={12} /> Позвонить
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === ПОРТФОЛИО === */}
        {tab === "portfolio" && (
          <>
            {screen === "projects" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-muted-foreground">Всего объектов: {projects.length}</p>
                  <button onClick={openNew}
                    className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm hover:opacity-80 transition-opacity">
                    <Icon name="Plus" size={14} /> Добавить объект
                  </button>
                </div>
                <div className="space-y-3">
                  {projects.map(p => (
                    <div key={p.id} className="border border-border p-4 flex items-center gap-4">
                      <div className="w-16 h-12 rounded overflow-hidden bg-secondary shrink-0">
                        {photos[String(p.id)]?.[0] && <img src={photos[String(p.id)][0].url} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground">{p.location} · {p.year} · {photos[String(p.id)]?.length || 0} фото</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => openPhotos(p)}
                          className="text-xs px-3 py-1.5 border border-border hover:border-foreground transition-colors flex items-center gap-1">
                          <Icon name="Image" size={12} /> Фото
                        </button>
                        <button onClick={() => openEdit(p)}
                          className="text-xs px-3 py-1.5 border border-border hover:border-foreground transition-colors flex items-center gap-1">
                          <Icon name="Pencil" size={12} /> Изменить
                        </button>
                        <button onClick={() => handleDeleteProject(p)}
                          className="text-xs px-2 py-1.5 border border-border hover:border-red-500 hover:text-red-500 transition-colors">
                          <Icon name="Trash2" size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(screen === "edit" || screen === "new") && (
              <div className="max-w-lg space-y-5">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Название объекта *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Например: ЖК «Победа»"
                    className="w-full border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors bg-background" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Описание работ</label>
                  <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Вентиляция, кондиционирование · 5 000 м²"
                    className="w-full border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors bg-background" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Город / регион</label>
                    <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Москва"
                      className="w-full border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors bg-background" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Год</label>
                    <input value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="2024"
                      className="w-full border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors bg-background" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={handleSaveProject} disabled={saving || !form.title.trim()}
                    className="px-6 py-3 bg-foreground text-background text-sm hover:opacity-80 transition-opacity disabled:opacity-40">
                    {saving ? "Сохраняю..." : screen === "new" ? "Создать объект" : "Сохранить"}
                  </button>
                  <button onClick={() => setScreen("projects")}
                    className="px-6 py-3 border border-border text-sm hover:border-foreground transition-colors">
                    Отмена
                  </button>
                </div>
              </div>
            )}

            {screen === "photos" && selectedProject && (
              <div>
                <div
                  className={`border-2 border-dashed rounded p-10 text-center cursor-pointer transition-colors mb-6 ${dragOverUpload ? "border-foreground bg-secondary" : "border-border hover:border-foreground/50"}`}
                  onClick={() => inputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOverUpload(true) }}
                  onDragLeave={() => setDragOverUpload(false)}
                  onDrop={e => { e.preventDefault(); setDragOverUpload(false); handleFiles(e.dataTransfer.files) }}
                >
                  <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
                  {uploading ? (
                    <p className="text-sm text-muted-foreground">Загружаю фотографии...</p>
                  ) : (
                    <>
                      <Icon name="Upload" size={32} className="mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm font-medium mb-1">Перетащите фото сюда или нажмите</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG, WEBP — можно несколько сразу</p>
                    </>
                  )}
                </div>

                {currentPhotos.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium">
                        Фотографии ({currentPhotos.length})
                        <span className="text-xs text-muted-foreground font-normal ml-2">— перетащите для изменения порядка</span>
                      </p>
                      {orderChanged && (
                        <button onClick={handleSaveOrder} disabled={saving}
                          className="text-xs px-3 py-1.5 bg-foreground text-background hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center gap-1.5">
                          <Icon name="Save" size={12} />
                          {saving ? "Сохраняю..." : "Сохранить порядок"}
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {currentPhotos.map((photo, i) => (
                        <div key={photo.id} draggable
                          onDragStart={() => onDragStart(i)} onDragEnter={() => onDragEnter(i)} onDragEnd={onDragEnd} onDragOver={e => e.preventDefault()}
                          className={`relative group aspect-[4/3] rounded overflow-hidden bg-secondary cursor-grab active:cursor-grabbing transition-all ${dropIndex === i && dragIndex !== i ? "ring-2 ring-foreground scale-[0.97]" : ""} ${dragIndex === i ? "opacity-50" : ""}`}
                        >
                          <img src={photo.url} alt="" className="w-full h-full object-cover pointer-events-none" />
                          {i === 0 && <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">Обложка</div>}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                          <button onClick={() => handleDeletePhoto(photo.id)}
                            className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all">
                            <Icon name="Trash2" size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
