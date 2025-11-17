<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGitHubConfig } from '@/composables/useGitHubConfig'
import { defaultGithubConfig } from '@/config/defaultGithubConfig'

const router = useRouter()
const { githubConfig, updateGitHubConfig } = useGitHubConfig()

const formData = ref({
  owner: githubConfig.value.owner || '',
  repo: githubConfig.value.repo || '',
  token: githubConfig.value.token || '',
  branch: githubConfig.value.branch || 'main',
  path: githubConfig.value.path || 'src/assets/photos',
})

watch(
  () => githubConfig.value,
  (config) => {
    formData.value = {
      owner: config.owner || '',
      repo: config.repo || '',
      token: config.token || '',
      branch: config.branch || 'main',
      path: config.path || 'src/assets/photos',
    }
  },
  { immediate: true }
)

const handleSave = () => {
  updateGitHubConfig({
    owner: formData.value.owner.trim(),
    repo: formData.value.repo.trim(),
    token: formData.value.token.trim(),
    branch: formData.value.branch.trim() || 'main',
    path: formData.value.path.trim() || 'src/assets/photos',
  })
  alert('已保存 GitHub 配置')
}

const handleClear = () => {
  if (!confirm('确定要清除当前配置吗？')) return
  updateGitHubConfig({
    owner: '',
    repo: '',
    token: '',
    branch: 'main',
    path: 'src/assets/photos',
  })
}

const handleApplyDefault = () => {
  formData.value = { ...defaultGithubConfig }
}

const handleBack = () => {
  router.back()
}
</script>

<template>
  <div class="github-config-view">
    <header class="config-header">
      <button class="back-btn" @click="handleBack">← 返回</button>
      <div>
        <p class="eyebrow">Secret Panel</p>
        <h1>GitHub 上传配置</h1>
        <p class="subtitle">设置用于云端同步的仓库信息</p>
      </div>
    </header>

    <section class="info-card">
      <p>
        通过 GitHub Contents API 直接推送图片，可用于多设备访问。建议创建一个仅用于图片的仓库，并使用拥有
        <code>repo</code> 权限的 Token。
      </p>
      <ul>
        <li>使用 <code>https://github.com/settings/tokens</code> 生成 PAT</li>
        <li>保持 Token 私密，避免泄露</li>
        <li>Path 建议放在仓库的静态资源目录内</li>
      </ul>
    </section>

    <section class="form-card">
      <div class="form-group">
        <label>仓库所有者 (Owner)</label>
        <input v-model="formData.owner" type="text" placeholder="your-github-username" />
      </div>
      <div class="form-group">
        <label>仓库名称 (Repo)</label>
        <input v-model="formData.repo" type="text" placeholder="photo-album" />
      </div>
      <div class="form-group-inline">
        <div class="form-group">
          <label>分支 (Branch)</label>
          <input v-model="formData.branch" type="text" placeholder="main" />
        </div>
        <div class="form-group">
          <label>路径 (Path)</label>
          <input v-model="formData.path" type="text" placeholder="src/assets/photos" />
        </div>
      </div>
      <div class="form-group">
        <label>Personal Access Token</label>
        <input v-model="formData.token" type="password" placeholder="ghp_xxxxxxxxxxxxx" />
        <p class="hint">
          建议 Token 仅开启 <code>repo</code> 权限，可在
          <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
            GitHub Settings
          </a>
          创建。
        </p>
      </div>
    </section>

    <div class="actions">
      <button class="ghost-btn" @click="handleApplyDefault">填入默认配置</button>
      <button class="ghost-btn danger" @click="handleClear">清除配置</button>
      <button class="primary-btn" @click="handleSave">保存配置</button>
    </div>
  </div>
</template>

<style scoped>
.github-config-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff5f7, #f4fbff);
  padding-bottom: 60px;
}

.config-header {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 24px clamp(16px, 5vw, 32px);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.back-btn {
  border: none;
  border-radius: 999px;
  padding: 10px 14px;
  background: rgba(15, 23, 42, 0.05);
  color: #0f172a;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.back-btn:active {
  transform: scale(0.96);
}

.eyebrow {
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 12px;
  color: #f472b6;
}

.config-header h1 {
  margin: 0;
  font-size: clamp(24px, 5vw, 32px);
  color: #0f172a;
}

.subtitle {
  margin: 4px 0 0;
  color: #64748b;
}

.info-card,
.form-card {
  max-width: 960px;
  margin: 24px auto 0;
  padding: clamp(18px, 4vw, 32px);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.info-card ul {
  margin: 12px 0 0;
  padding-left: 18px;
  color: #64748b;
}

.form-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group-inline {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

label {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

input {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

input:focus {
  outline: none;
  border-color: #ff7eb3;
  box-shadow: 0 0 0 3px rgba(255, 126, 179, 0.15);
}

.hint {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
}

.hint code {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
}

.actions {
  max-width: 960px;
  margin: 24px auto;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: flex-end;
  padding: 0 clamp(16px, 5vw, 32px);
}

.ghost-btn,
.primary-btn {
  border: none;
  border-radius: 999px;
  padding: 12px 20px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.ghost-btn {
  background: rgba(15, 23, 42, 0.05);
  color: #0f172a;
}

.ghost-btn.danger {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.primary-btn {
  background: linear-gradient(120deg, #ff7eb3, #ff758c);
  color: #fff;
  box-shadow: 0 12px 24px rgba(255, 118, 136, 0.35);
}

.ghost-btn:active,
.primary-btn:active {
  transform: scale(0.97);
}

@media (max-width: 640px) {
  .config-header {
    flex-direction: column;
  }

  .actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

