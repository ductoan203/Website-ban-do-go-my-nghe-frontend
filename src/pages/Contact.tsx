import React, { useState } from 'react'
import { HiPhone, HiMail, HiLocationMarker } from 'react-icons/hi'
import axios from 'axios'
import { toast } from 'react-toastify'
import { API_URL } from '../config'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await axios.post(`${API_URL}/contact`, formData)
      toast.success('Gửi tin nhắn thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.')
      setFormData({ name: '', email: '', message: '' })
    } catch (error) {
      toast.error('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.')
      console.error('Error sending message:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Liên Hệ</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Thông tin liên hệ */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông Tin Liên Hệ</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <HiPhone className="w-6 h-6 text-amber-600 mr-3" />
              <div>
                <p className="text-gray-600">Hotline</p>
                <p className="font-medium">0123 456 789</p>
              </div>
            </div>
            <div className="flex items-center">
              <HiMail className="w-6 h-6 text-amber-600 mr-3" />
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium">info@hungdung.com</p>
              </div>
            </div>
            <div className="flex items-center">
              <HiLocationMarker className="w-6 h-6 text-amber-600 mr-3" />
              <div>
                <p className="text-gray-600">Địa chỉ</p>
                <p className="font-medium">123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form liên hệ */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Gửi Tin Nhắn</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Họ và tên
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Tin nhắn
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Contact 