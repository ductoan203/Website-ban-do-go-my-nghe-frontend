const Footer = () => (
  <footer className="bg-[#8B4513] text-white py-8 mt-8">
    <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 className="font-bold text-lg mb-2">Đồ gỗ mỹ nghệ Hùng Dũng</h3>
        <p>Chuyên cung cấp các sản phẩm đồ gỗ mỹ nghệ cao cấp, uy tín, chất lượng.</p>
      </div>
      <div>
        <h3 className="font-bold text-lg mb-2">Liên hệ</h3>
        <p>Địa chỉ: La Xuyên, Yên Ninh, Ý Yên, Nam Định</p>
        <p>Hotline: 0123 456 789</p>
        <p>Email: dogohungdung@gmail.com</p>
      </div>
      <div>
        <h3 className="font-bold text-lg mb-2">Kết nối</h3>
        <div className="flex gap-4 mt-2">
          <a href="#" className="hover:text-yellow-200 transition">Facebook</a>
          <a href="#" className="hover:text-yellow-200 transition">Zalo</a>
          <a href="#" className="hover:text-yellow-200 transition">Instagram</a>
        </div>
      </div>
    </div>
    <div className="text-center mt-8 text-sm text-yellow-100">
      © {new Date().getFullYear()} Đồ gỗ mỹ nghệ Hùng Dũng. All rights reserved.
    </div>
  </footer>
)

export default Footer 