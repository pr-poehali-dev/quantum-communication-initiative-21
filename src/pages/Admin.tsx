import { useState, useRef, useEffect } from "react"
import func2url from "../../backend/func2url.json"
import Icon from "@/components/ui/icon"

const UPLOAD_URL = (func2url as Record<string, string>)["upload-photo"]
const GET_PHOTOS_URL = (func2url as Record<string, string>)["get-photos"]
const REORDER_URL = (func2url as Record<string, string>)["reorder-photos"]
const ADMIN_PASSWORD = "mkm2024admin"

const PROJECTS = [
  { id: 1, title: "МТС-2, д. Радумля" },
  { id: 2, title: "ЖК Космодемьянская" },
  { id: 3, title: "Склад «Сладкая Жизнь»" },
  { id: 4, title: "«Сладкая Жизнь»" },
  { id: 5, title: "Мясокомбинат, д. Чернышиха" },
  { id: 6, title: "Завод Coca-Cola" },
  { id: 7, title: "ЖК «Filicity»" },
]

type Photo = { id: number; url: string }
type PhotoMap = Record<string, Photo[]>

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function Admin() {
  const [password, setPassword] = useState("")
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState("")
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [photos, setPhotos] = useState<PhotoMap>({})
  const [currentPhotos, setCurrentPhotos] = useState<Photo[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const loadPhotos = () => {
    fetch(GET_PHOTOS_URL)
      .then((r) => r.json())
      .then((data) => setPhotos(data.photos || {}))
      .catch(() => {})
  }

  useEffect(() => {
    if (authed) loadPhotos()
  }, [authed])

  useEffect(() => {
    if (selectedProject) {
      setCurrentPhotos(photos[String(selectedProject)] || [])
    }
  }, [selectedProject, photos])

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true)
      setAuthError("")
    } else {
      setAuthError("Неверный пароль")
    }
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || !selectedProject) return
    setUploading(true)
    for (const file of Array.from(files)) {
      const base64 = await fileToBase64(file)
      await fetch(UPLOAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: ADMIN_PASSWORD, image: base64, contentType: file.type, projectId: selectedProject }),
      })
    }
    setUploading(false)
    loadPhotos()
  }

  const handleDelete = async (photoId: number) => {
    await fetch(UPLOAD_URL, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: ADMIN_PASSWORD, id: photoId }),
    })
    loadPhotos()
  }

  const handleSaveOrder = async () => {
    setSaving(true)
    await fetch(REORDER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: ADMIN_PASSWORD, ids: currentPhotos.map((p) => p.id) }),
    })
    setSaving(false)
    loadPhotos()
  }

  // drag-and-drop handlers
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
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors bg-background"
            />
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button
              onClick={handleLogin}
              className="w-full bg-foreground text-background py-3 text-sm font-medium hover:opacity-80 transition-opacity"
            >
              Войти
            </button>
          </div>
        </div>
      </div>
    )
  }

  const savedOrder = photos[String(selectedProject)] || []
  const orderChanged = JSON.stringify(currentPhotos.map((p) => p.id)) !== JSON.stringify(savedOrder.map((p) => p.id))

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-medium">Управление фотографиями</h1>
        <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← На сайт</a>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          {PROJECTS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProject(p.id)}
              className={`text-left px-4 py-3 border text-sm transition-colors ${
                selectedProject === p.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:border-foreground"
              }`}
            >
              <span className="text-xs opacity-50 block mb-0.5">
                Объект {p.id} · {photos[String(p.id)]?.length || 0} фото
              </span>
              {p.title}
            </button>
          ))}
        </div>

        {selectedProject && (
          <div>
            <h2 className="text-base font-medium mb-4">
              {PROJECTS.find((p) => p.id === selectedProject)?.title}
            </h2>

            <div
              className={`border-2 border-dashed rounded p-10 text-center cursor-pointer transition-colors mb-6 ${
                dragOver ? "border-foreground bg-secondary" : "border-border hover:border-foreground/50"
              }`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
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
                    Фотографии объекта ({currentPhotos.length})
                    <span className="text-xs text-muted-foreground font-normal ml-2">— перетащите для изменения порядка</span>
                  </p>
                  {orderChanged && (
                    <button
                      onClick={handleSaveOrder}
                      disabled={saving}
                      className="text-xs px-3 py-1.5 bg-foreground text-background hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Icon name="Save" size={12} />
                      {saving ? "Сохраняю..." : "Сохранить порядок"}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {currentPhotos.map((photo, i) => (
                    <div
                      key={photo.id}
                      draggable
                      onDragStart={() => onDragStart(i)}
                      onDragEnter={() => onDragEnter(i)}
                      onDragEnd={onDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                      className={`relative group aspect-[4/3] rounded overflow-hidden bg-secondary cursor-grab active:cursor-grabbing transition-all ${
                        dropIndex === i && dragIndex !== i ? "ring-2 ring-foreground scale-[0.97]" : ""
                      } ${dragIndex === i ? "opacity-50" : ""}`}
                    >
                      <img src={photo.url} alt="" className="w-full h-full object-cover pointer-events-none" />
                      {i === 0 && (
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                          Обложка
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {i !== 0 && <div className="bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">#{i + 1}</div>}
                      </div>
                      <button
                        onClick={() => handleDelete(photo.id)}
                        className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all"
                        title="Удалить"
                      >
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
