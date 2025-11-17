import type { GitHubConfig } from '@/types/github'

/**
 * 默认的 GitHub 仓库配置，可根据需要修改。
 * 这些值会在没有设置环境变量或本地配置时作为 fallback。
 * 建议不要在此处填写真实的 Token。
 */
export const defaultGithubConfig: GitHubConfig = {
  owner: 'guangmingcunliutao',
  repo: 'photo-album',
  token: '',
  branch: 'main',
  path: 'src/assets/photos',
}

