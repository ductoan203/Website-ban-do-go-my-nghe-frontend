import React, { useRef } from 'react'
import axios from 'axios'

interface UploadImageProps {
  onUploaded: (url: string) => void
  label?: string
  multiple?: boolean
}

const UploadImage: React.FC<UploadImageProps> = ({ onUploaded, label = 'Chọn ảnh', multiple = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const formData = new FormData()
      formData.append('image', file)
      try {
        const res = await axios.post<{ result: string }>(
          'http://localhost:8080/doan/admin/products/upload-image',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        const url = res.data.result
        onUploaded(url)
      } catch (err) {
        alert('Upload ảnh thất bại!')
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        className="bg-[#8B4513] text-white px-4 py-2 rounded hover:bg-[#6B3410]"
      >
        {label}
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleChange}
        className="hidden"
        multiple={multiple}
      />
    </div>
  )
}

export default UploadImage 