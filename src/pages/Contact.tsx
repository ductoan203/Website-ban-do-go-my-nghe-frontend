import React from 'react'
import { HiPhone, HiMail, HiLocationMarker } from 'react-icons/hi'

const Contact = () => {
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
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Họ và tên
              </label>
              <input
                type="text"
                id="name"
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Tin nhắn
              </label>
              <textarea
                id="message"
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Gửi tin nhắn
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Contact 