import { ref } from 'vue'

const STORAGE_KEY = 'photo-album:user-photos'

const userPhotos = ref<string[]>([])

const safeWindow = typeof window !== 'undefined' ? window : null

const loadFromStorage = () => {
  if (!safeWindow) return
  try {
    const raw = safeWindow.localStorage.getItem(STORAGE_KEY)
    userPhotos.value = raw ? (JSON.parse(raw) as string[]) : []
  } catch (error) {
    console.warn('[useUserPhotos] Failed to read user photos from storage', error)
    userPhotos.value = []
  }
}

const persist = () => {
  if (!safeWindow) return
  safeWindow.localStorage.setItem(STORAGE_KEY, JSON.stringify(userPhotos.value))
}

if (safeWindow) {
  loadFromStorage()
}

export const useUserPhotos = () => {
  const addPhotos = (photos: string[]) => {
    if (!photos.length) return
    userPhotos.value = [...photos, ...userPhotos.value]
    persist()
  }

  const clearPhotos = () => {
    userPhotos.value = []
    persist()
  }

  return {
    userPhotos,
    addPhotos,
    clearPhotos,
    reload: loadFromStorage,
  }
}

