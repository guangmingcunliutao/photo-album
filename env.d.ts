/// <reference types="vite/client" />

// 扩展 ImportMeta 接口，支持 glob
interface ImportMeta {
  glob<Module = { [key: string]: any }>(
    pattern: string,
    options?: {
      eager?: boolean
      as?: string
    }
  ): Record<string, Module>
}
