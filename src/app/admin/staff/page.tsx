'use client'

import React from 'react'

// Dữ liệu mô phỏng — giữ đồng bộ với pethub-app/app/pages/admin/staff.vue
const staffList = [
  { id: 'usr_staff_1', name: 'Nguyễn Văn An', title: 'Chuyên viên Grooming & Cắt tỉa tạo kiểu', status: 'ON_DUTY', activeCa: 'Full Grooming bé Milo (10:00 - 12:00)', phone: '0912 345 678' },
  { id: 'usr_staff_2', name: 'Trần Thị Bích', title: 'Kỹ thuật viên Tắm & Vệ sinh spa', status: 'AVAILABLE', activeCa: 'Chưa có ca', phone: '0933 456 789' },
  { id: 'usr_staff_3', name: 'Lê Hoàng Cường', title: 'Nhân viên Chăm sóc & Vận động thú cưng', status: 'AVAILABLE', activeCa: 'Chưa có ca', phone: '0977 123 999' },
]

export default function AdminStaffPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
            Quản lý Nhân sự & Phân ca (Staff Assignments)
          </h1>
          <p className="text-xs text-slate-500">Giám sát ca làm việc và điều phối kỹ thuật viên (Section 4.3 & 11).</p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs">
          + Thêm nhân sự mới
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Kỹ thuật viên</th>
                <th className="py-3 px-4">Chuyên môn</th>
                <th className="py-3 px-4">Số điện thoại</th>
                <th className="py-3 px-4">Trạng thái ca trực</th>
                <th className="py-3 px-4">Ca đang thực hiện</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffList.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{st.name}</td>
                  <td className="py-3.5 px-4">{st.title}</td>
                  <td className="py-3.5 px-4 font-mono">{st.phone}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        st.status === 'ON_DUTY' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {st.status === 'ON_DUTY' ? '⚡ Đang có ca' : '✓ Sẵn sàng'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{st.activeCa}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold">
                      Phân ca →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
