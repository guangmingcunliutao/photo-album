import { ref } from 'vue'
import { useGitHubConfig } from './useGitHubConfig'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export const useGitHubUpload = () => {
  const { githubConfig, isConfigured } = useGitHubConfig()
  const isUploading = ref(false)
  const uploadProgress = ref(0)

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // 移除 data:image/...;base64, 前缀
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || 'jpg'
  }

  const generateFileName = (originalName: string): string => {
    const ext = getFileExtension(originalName)
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `${timestamp}-${random}.${ext}`
  }

  const uploadToGitHub = async (file: File): Promise<UploadResult> => {
    if (!isConfigured.value) {
      return {
        success: false,
        error: '请先在"我的"页面配置 GitHub 信息',
      }
    }

    isUploading.value = true
    uploadProgress.value = 0

    try {
      const config = githubConfig.value
      const fileName = generateFileName(file.name)
      const filePath = `${config.path}/${fileName}`.replace(/\/+/g, '/')

      // 转换为 base64
      uploadProgress.value = 20
      const content = await fileToBase64(file)

      // 检查文件是否已存在（获取 SHA）
      uploadProgress.value = 40
      let sha: string | undefined
      try {
        const checkUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}?ref=${config.branch}`
        const checkResponse = await fetch(checkUrl, {
          headers: {
            Authorization: `Bearer ${config.token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        })
        if (checkResponse.ok) {
          const data = await checkResponse.json()
          sha = data.sha
        }
      } catch (error) {
        // 文件不存在，继续上传
      }

      // 上传文件
      uploadProgress.value = 60
      const uploadUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`
      const uploadBody = {
        message: `Upload photo: ${fileName}`,
        content,
        branch: config.branch,
        ...(sha && { sha }), // 如果文件存在，需要提供 SHA 来更新
      }

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${config.token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadBody),
      })

      uploadProgress.value = 80

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}))
        throw new Error(errorData.message || `上传失败: ${uploadResponse.statusText}`)
      }

      await uploadResponse.json()
      uploadProgress.value = 100

      // 构建图片 URL（使用 GitHub raw content）
      const imageUrl = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${filePath}`

      return {
        success: true,
        url: imageUrl,
      }
    } catch (error) {
      console.error('[useGitHubUpload] Upload failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '上传失败，请重试',
      }
    } finally {
      isUploading.value = false
      setTimeout(() => {
        uploadProgress.value = 0
      }, 500)
    }
  }

  const uploadMultiple = async (files: File[]): Promise<UploadResult[]> => {
    const results: UploadResult[] = []
    for (let i = 0; i < files.length; i++) {
      const result = await uploadToGitHub(files[i])
      results.push(result)
      // 避免请求过快
      if (i < files.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }
    return results
  }

  return {
    isUploading,
    uploadProgress,
    uploadToGitHub,
    uploadMultiple,
    isConfigured,
  }
}

