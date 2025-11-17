import { ref } from 'vue'

export type TransitionEffect = 'fade' | 'slide' | 'zoom' | 'rotate' | 'flip'

const STORAGE_KEY = 'photo-album:transition-effect'

const safeWindow = typeof window !== 'undefined' ? window : null

const defaultEffect: TransitionEffect = 'fade'

const loadFromStorage = (): TransitionEffect => {
  if (!safeWindow) return defaultEffect
  try {
    const stored = safeWindow.localStorage.getItem(STORAGE_KEY)
    if (stored && ['fade', 'slide', 'zoom', 'rotate', 'flip'].includes(stored)) {
      return stored as TransitionEffect
    }
  } catch (error) {
    console.warn('[useTransitionEffect] Failed to read effect from storage', error)
  }
  return defaultEffect
}

const persist = (effect: TransitionEffect) => {
  if (!safeWindow) return
  try {
    safeWindow.localStorage.setItem(STORAGE_KEY, effect)
  } catch (error) {
    console.warn('[useTransitionEffect] Failed to save effect to storage', error)
  }
}

const currentEffect = ref<TransitionEffect>(loadFromStorage())

export const useTransitionEffect = () => {
  const setEffect = (effect: TransitionEffect) => {
    currentEffect.value = effect
    persist(effect)
  }

  return {
    currentEffect,
    setEffect,
  }
}

