'use client'

import React from 'react'

const staffPerformance = [
  { name: 'Nguyễn Văn An', completed: 85, rating: 4.8, revenue: 18500000 },
  { name: 'Trần Thị Bích', completed: 73, rating: 4.6, revenue: 15200000 },
  { name: 'Lê Hoàng Cường', completed: 62, rating: 4.7, revenue: 12800000 },
]

const popularServices = [
  { name: 'Bath & Blow Dry (Tắm Sấy)', count: 120, pct: '38%' },
  { name: 'Full Grooming (Cắt Tỉa Toàn Diện)', count: 85, pct: '27%' },
  { name: 'Nail Trim (Cắt Mài Móng)', count: 63, pct: '20%' },
  { name: 'Pet Boarding (Khách Sạn)', count: 50, pct: '15%' },
]

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
          Bảng Quản trị & Chỉ số Vận hành (Admin Dashboard)
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Tổng quan công suất cơ sở, doanh thu, phân bổ nhân sự và chất lượng dịch vụ.
        </p>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Bookings Hôm nay
          </div>
          <div className="text-3xl font-extrabold font-display text-slate-900 mt-2">28</div>
          <div className="text-xs text-indigo-600 font-medium mt-1">↑ 14% so với tuần trước</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Doanh thu hôm nay
          </div>
          <div className="text-2xl font-extrabold font-display text-emerald-700 mt-2">
            {formatVND(8500000)}
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">Tháng này: 35.000.000 đ</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Công suất phòng (Occupancy)
          </div>
          <div className="text-3xl font-extrabold font-display text-indigo-700 mt-2">78%</div>
          <div className="text-xs text-slate-500 font-medium mt-1">16/20 chuồng đang có thú</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Dịch vụ hoàn thành
          </div>
          <div className="text-3xl font-extrabold font-display text-teal-700 mt-2">22</div>
          <div className="text-xs text-teal-600 font-medium mt-1">6 ca đang chăm sóc</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Đánh giá trung bình
          </div>
          <div className="text-3xl font-extrabold font-display text-amber-500 mt-2">4.7 ★</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Dựa trên 218 lượt review</div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Popular Services */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
          <h3 className="font-bold text-slate-900 text-base font-display">
            Dịch vụ Phổ biến nhất
          </h3>
          <div className="space-y-3">
            {popularServices.map((srv) => (
              <div key={srv.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-800">{srv.name}</span>
                  <span className="text-slate-500 font-bold">
                    {srv.count} lượt ({srv.pct})
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: srv.pct }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Performance */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
          <h3 className="font-bold text-slate-900 text-base font-display">
            Hiệu suất Nhân viên (Staff Performance)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Nhân viên</th>
                  <th className="py-2.5 px-3">Đã xong</th>
                  <th className="py-2.5 px-3">Đánh giá</th>
                  <th className="py-2.5 px-3 text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffPerformance.map((staff) => (
                  <tr key={staff.name} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-medium text-slate-900">{staff.name}</td>
                    <td className="py-3 px-3">{staff.completed} ca</td>
                    <td className="py-3 px-3 text-amber-600 font-bold">{staff.rating} ★</td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-900">
                      {formatVND(staff.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
