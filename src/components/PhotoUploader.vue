<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserPhotos } from '@/composables/useUserPhotos'
import { useGitHubUpload } from '@/composables/useGitHubUpload'

const props = defineProps<{
  maxSizeMB?: number
}>()

const emit = defineEmits<{
  photosAdded: [number]
}>()

const MAX_SIZE_MB = computed(() => props.maxSizeMB ?? 10)
const isBusy = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const uploadMode = ref<'local' | 'github'>('local')

const { addPhotos, clearPhotos, userPhotos, removePhoto } = useUserPhotos()
const { isUploading, uploadProgress, uploadMultiple, isConfigured } = useGitHubUpload()

const readFileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

const handleSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files?.length) return

  const files = Array.from(target.files)
  const oversized = files.find((file) => file.size > MAX_SIZE_MB.value * 1024 * 1024)
  if (oversized) {
    errorMessage.value = `文件 ${oversized.name} 超过 ${MAX_SIZE_MB.value}MB，已取消上传`
    target.value = ''
    return
  }

  isBusy.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    if (uploadMode.value === 'github') {
      if (!isConfigured.value) {
        errorMessage.value = '请先在"我的"页面配置 GitHub 信息'
        target.value = ''
        return
      }

      const results = await uploadMultiple(files)
      const successCount = results.filter((r) => r.success).length
      const failedCount = results.length - successCount

      if (successCount > 0) {
        successMessage.value = `成功上传 ${successCount} 张照片到 GitHub`
        // 将 GitHub URL 添加到本地相册
        const urls = results.filter((r) => r.success && r.url).map((r) => r.url!)
        if (urls.length > 0) {
          addPhotos(urls)
          emit('photosAdded', urls.length)
        }
      }

      if (failedCount > 0) {
        errorMessage.value = `${failedCount} 张照片上传失败，请检查配置或重试`
      }
    } else {
      // 本地模式
      const dataUrls = await Promise.all(files.map(readFileToDataUrl))
      addPhotos(dataUrls)
      emit('photosAdded', dataUrls.length)
      successMessage.value = `已添加 ${dataUrls.length} 张照片到本地相册`
    }
  } catch (error) {
    errorMessage.value = '上传失败，请重试'
    console.error(error)
  } finally {
    isBusy.value = false
    target.value = ''
  }
}

const handleClear = () => {
  if (!userPhotos.value.length) return
  if (!confirm('确定要清空已上传的照片吗？')) return
  clearPhotos()
  emit('photosAdded', 0)
}

const handleRemovePhoto = (index: number) => {
  removePhoto(index)
  successMessage.value = '已删除 1 张照片'
}
</script>

<template>
  <section class="uploader-card">
    <div class="upload-mode-selector">
      <button
        class="mode-btn"
        :class="{ active: uploadMode === 'local' }"
        @click="uploadMode = 'local'"
      >
        📱 本地存储
      </button>
      <button
        class="mode-btn"
        :class="{ active: uploadMode === 'github', disabled: !isConfigured }"
        @click="uploadMode = 'github'"
        :disabled="!isConfigured"
      >
        ☁️ GitHub
      </button>
    </div>

    <div class="uploader-content">
      <div>
        <p class="hint">
          {{
            uploadMode === 'github'
              ? '📤 上传到 GitHub 仓库，可在任何地方访问'
              : '📲 图片仅存在当前设备的浏览器中'
          }}
        </p>
        <label class="upload-btn" :class="{ uploading: isBusy || isUploading }">
          <input
            type="file"
            accept="image/*"
            multiple
            :disabled="isBusy || isUploading"
            @change="handleSelect"
          />
          <span v-if="isBusy || isUploading">
            {{ uploadMode === 'github' ? `上传中 ${uploadProgress}%` : '处理中…' }}
          </span>
          <span v-else>选择照片</span>
        </label>
        <div v-if="isUploading && uploadMode === 'github'" class="progress-bar">
          <div class="progress-fill" :style="{ width: `${uploadProgress}%` }"></div>
        </div>
      </div>
      <button
        v-if="uploadMode === 'local'"
        class="ghost-btn"
        :disabled="!userPhotos.length"
        @click="handleClear"
      >
        清空
      </button>
    </div>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-else-if="successMessage" class="success">{{ successMessage }}</p>
    <p v-else class="hint small">
      {{ uploadMode === 'github' ? '单张大小 ≤ 10MB · 需要配置 GitHub' : '单张大小 ≤ 10MB · 未联网也能用' }}
    </p>

    <div v-if="userPhotos.length" class="uploaded-preview">
      <p class="preview-title">本地已添加 {{ userPhotos.length }} 张</p>
      <div class="preview-grid">
        <div v-for="(photo, index) in userPhotos" :key="photo" class="preview-item">
          <img :src="photo" alt="uploaded photo" loading="lazy" />
          <button class="remove-btn" @click="handleRemovePhoto(index)">×</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.uploader-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 25px 45px rgba(31, 38, 135, 0.2);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-mode-selector {
  display: flex;
  gap: 8px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 12px;
}

.mode-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-btn.active {
  background: #fff;
  color: #ff7eb3;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.1);
}

.mode-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.uploader-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.hint {
  margin: 0;
  color: #4d4d4d;
}

.hint.small {
  font-size: 13px;
  color: #6b7280;
}

.upload-btn {
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;
  border-radius: 999px;
  background: linear-gradient(120deg, #ff7eb3, #ff758c, #ff9770);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  border: none;
  gap: 6px;
  box-shadow: 0 10px 20px rgba(255, 118, 136, 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.upload-btn:hover:not(.uploading) {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(255, 118, 136, 0.45);
}

.upload-btn.uploading {
  opacity: 0.8;
  cursor: wait;
}

.progress-bar {
  margin-top: 8px;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(120deg, #ff7eb3, #ff758c);
  transition: width 0.3s ease;
}

.upload-btn input {
  display: none;
}

.ghost-btn {
  padding: 10px 18px;
  border-radius: 12px;
  border: 1px dashed #ff7eb3;
  color: #ff7eb3;
  background: transparent;
  cursor: pointer;
  transition: background 0.2s ease;
}

.ghost-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.ghost-btn:not(:disabled):hover {
  background: rgba(255, 126, 179, 0.1);
}

.error {
  color: #ef4444;
  margin: 0;
  font-size: 14px;
}

.success {
  color: #10b981;
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

.uploaded-preview {
  margin-top: 12px;
  background: rgba(15, 23, 42, 0.02);
  border: 1px dashed rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  padding: 12px;
}

.preview-title {
  margin: 0 0 8px;
  font-size: 13px;
  color: #475569;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(64px, 1fr));
  gap: 8px;
}

.preview-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 1;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.65);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}
</style>

