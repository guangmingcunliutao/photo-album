/// <reference types="vite/client" />
/// <reference types="vite-plugin-pages/client" />

// 扩展 ImportMeta 接口，支持 glob
interface ImportMeta {
  glob<Module = { [key: string]: any }>(
    pattern: string,
    options?: {
      eager?: boolean
      as?: string
    }
  ): Record<string, Module>

  readonly env: {
    readonly VITE_GITHUB_OWNER?: string
    readonly VITE_GITHUB_REPO?: string
    readonly VITE_GITHUB_TOKEN?: string
    readonly VITE_GITHUB_BRANCH?: string
    readonly VITE_GITHUB_PATH?: string
    [key: string]: any
  }
}
