import { useState, useRef } from "react"
import func2url from "../../backend/func2url.json"
import Icon from "@/components/ui/icon"

const UPLOAD_URL = (func2url as Record<string, string>)["upload-photo"]

const PROJECTS = [
  { id: 1, title: "МТС-2, д. Радумля" },
  { id: 2, title: "ЖК Космодемьянская" },
  { id: 3, title: "Склад «Сладкая Жизнь»" },
  { id: 4, title: "«Сладкая Жизнь»" },
  { id: 5, title: "Мясокомбинат, д. Чернышиха" },
  { id: 6, title: "Завод Coca-Cola" },
  { id: 7, title: "ЖК «Filicity»" },
]

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
  const [uploadedUrls, setUploadedUrls] = useState<Record<number, string[]>>({})
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleLogin = () => {
    if (password === "mkm2024admin") {
      setAuthed(true)
      setAuthError("")
    } else {
      setAuthError("Неверный пароль")
    }
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || !selectedProject) return
    setUploading(true)

    const urls: string[] = []
    for (const file of Array.from(files)) {
      const base64 = await fileToBase64(file)
      const res = await fetch(UPLOAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "mkm2024admin", image: base64, contentType: file.type }),
      })
      const data = await res.json()
      if (data.url) urls.push(data.url)
    }

    setUploadedUrls((prev) => ({
      ...prev,
      [selectedProject]: [...(prev[selectedProject] || []), ...urls],
    }))
    setUploading(false)
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
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

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-medium">Управление фотографиями</h1>
        <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← На сайт</a>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <p className="text-sm text-muted-foreground mb-6">Выберите объект и загрузите фотографии. Скопируйте полученные ссылки и передайте разработчику для обновления сайта.</p>

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
              <span className="text-xs opacity-50 block mb-0.5">Объект {p.id}</span>
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

            {(uploadedUrls[selectedProject] || []).length > 0 && (
              <div>
                <p className="text-sm font-medium mb-3">Загруженные фотографии:</p>
                <div className="space-y-3">
                  {(uploadedUrls[selectedProject] || []).map((url) => (
                    <div key={url} className="flex items-center gap-3 border border-border p-3 rounded">
                      <img src={url} alt="" className="w-16 h-12 object-cover rounded shrink-0" />
                      <p className="text-xs text-muted-foreground truncate flex-1">{url}</p>
                      <button
                        onClick={() => copyUrl(url)}
                        className="shrink-0 text-xs px-3 py-1.5 border border-border hover:border-foreground transition-colors flex items-center gap-1.5"
                      >
                        <Icon name={copiedUrl === url ? "Check" : "Copy"} size={12} />
                        {copiedUrl === url ? "Скопировано" : "Копировать"}
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
