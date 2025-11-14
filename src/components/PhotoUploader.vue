<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserPhotos } from '@/composables/useUserPhotos'

const props = defineProps<{
  maxSizeMB?: number
}>()

const emit = defineEmits<{
  photosAdded: [number]
}>()

const MAX_SIZE_MB = computed(() => props.maxSizeMB ?? 3)
const isBusy = ref(false)
const errorMessage = ref('')

const { addPhotos, clearPhotos, userPhotos } = useUserPhotos()

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
  try {
    const dataUrls = await Promise.all(files.map(readFileToDataUrl))
    addPhotos(dataUrls)
    emit('photosAdded', dataUrls.length)
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
</script>

<template>
  <section class="uploader-card">
    <div class="uploader-content">
      <div>
        <p class="hint">📲 支持直接从手机上传，图片仅存在当前设备的浏览器中</p>
        <label class="upload-btn">
          <input type="file" accept="image/*" multiple :disabled="isBusy" @change="handleSelect" />
          <span>{{ isBusy ? '处理中…' : '选择照片' }}</span>
        </label>
      </div>
      <button class="ghost-btn" :disabled="!userPhotos.length" @click="handleClear">清空</button>
    </div>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-else class="hint small">单张大小 ≤ {{ MAX_SIZE_MB }}MB · 未联网也能用</p>
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
  gap: 8px;
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

.upload-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(255, 118, 136, 0.45);
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
</style>

