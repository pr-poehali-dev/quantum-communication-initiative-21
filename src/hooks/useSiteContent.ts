import { useState, useEffect } from "react"
import func2url from "../../backend/func2url.json"

const MANAGE_URL = (func2url as Record<string, string>)["manage-projects"]

export type ContentMap = Record<string, string>

let cache: ContentMap | null = null
let promise: Promise<ContentMap> | null = null
const listeners: Set<(m: ContentMap) => void> = new Set()

function fetchContent(force = false): Promise<ContentMap> {
  if (!force && promise) return promise
  promise = fetch(`${MANAGE_URL}?resource=content&_=${Date.now()}`)
    .then(r => r.json())
    .then(d => {
      const map: ContentMap = {}
      for (const [key, val] of Object.entries(d.content || {})) {
        map[key] = (val as { value: string }).value
      }
      cache = map
      listeners.forEach(fn => fn(map))
      return map
    })
    .catch(() => {
      promise = null
      return {} as ContentMap
    })
  return promise
}

export function invalidateContent() {
  cache = null
  promise = null
  fetchContent(true)
}

export function useSiteContent(): ContentMap {
  const [content, setContent] = useState<ContentMap>(cache || {})

  useEffect(() => {
    listeners.add(setContent)
    if (cache) { setContent(cache) }
    else { fetchContent().then(setContent) }
    return () => { listeners.delete(setContent) }
  }, [])

  return content
}

export function c(content: ContentMap, key: string, fallback = ""): string {
  return content[key] ?? fallback
}
