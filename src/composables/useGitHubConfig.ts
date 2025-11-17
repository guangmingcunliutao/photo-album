import { ref, computed } from 'vue'
import type { GitHubConfig } from '@/types/github'
import { defaultGithubConfig } from '@/config/defaultGithubConfig'

const STORAGE_KEY = 'photo-album:github-config'

const safeWindow = typeof window !== 'undefined' ? window : null

// 默认配置（可以从环境变量或 defaultGithubConfig 中读取）
const getDefaultConfig = (): GitHubConfig => {
  const env = import.meta.env
  return {
    owner: env.VITE_GITHUB_OWNER || defaultGithubConfig.owner,
    repo: env.VITE_GITHUB_REPO || defaultGithubConfig.repo,
    token: env.VITE_GITHUB_TOKEN || defaultGithubConfig.token,
    branch: env.VITE_GITHUB_BRANCH || defaultGithubConfig.branch,
    path: env.VITE_GITHUB_PATH || defaultGithubConfig.path,
  }
}

const defaultConfig: GitHubConfig = getDefaultConfig()

const loadFromStorage = (): GitHubConfig => {
  if (!safeWindow) return defaultConfig
  try {
    const stored = safeWindow.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...defaultConfig, ...JSON.parse(stored) }
    }
  } catch (error) {
    console.warn('[useGitHubConfig] Failed to read config from storage', error)
  }
  return defaultConfig
}

const persist = (config: GitHubConfig) => {
  if (!safeWindow) return
  try {
    safeWindow.localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch (error) {
    console.warn('[useGitHubConfig] Failed to save config to storage', error)
  }
}

const githubConfig = ref<GitHubConfig>(loadFromStorage())

export const useGitHubConfig = () => {
  const isConfigured = computed(() => {
    return !!(
      githubConfig.value.owner &&
      githubConfig.value.repo &&
      githubConfig.value.token
    )
  })

  const updateGitHubConfig = (config: Partial<GitHubConfig>) => {
    githubConfig.value = { ...githubConfig.value, ...config }
    persist(githubConfig.value)
  }

  return {
    githubConfig,
    isConfigured,
    updateGitHubConfig,
  }
}

