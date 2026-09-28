import { useState } from 'react'
import { adminApi } from '../services/adminApi'
import { useToast } from '../context/AdminContext'

export default function useUpload() {
  const toast = useToast()
  const [uploading, setUploading] = useState(false)

  const upload = async (files) => {
    if (!files?.length) return []
    setUploading(true)
    try {
      const stored = await adminApi.media.upload(Array.from(files))
      toast.success(stored.length > 1 ? `${stored.length} images uploaded` : 'Image uploaded')
      return stored
    } catch (err) {
      toast.error(err.message || 'Upload failed')
      return []
    } finally {
      setUploading(false)
    }
  }

  return { upload, uploading }
}
