import axios from 'axios'

const API_URL = 'http://localhost:8080/doan/admin/products/upload-image'

export const uploadImage = (file: File) => {
  const formData = new FormData()
  formData.append('image', file)
  return axios.post(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
} 