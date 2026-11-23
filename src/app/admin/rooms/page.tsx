'use client'

import React from 'react'

// Dữ liệu mô phỏng — giữ đồng bộ với pethub-app/app/pages/admin/rooms.vue
const rooms = [
  { id: 'rm_1', name: 'Phòng VIP 101 (Chó lớn)', type: 'VIP Suite', capacity: '1 Chó lớn (tối đa 30kg)', occupied: true, pet: 'Milo (Golden)', temp: '24°C' },
  { id: 'rm_2', name: 'Phòng Deluxe 102 (Mèo)', type: 'Cat Condo', capacity: '1-2 Mèo', occupied: true, pet: 'Luna (British Shorthair)', temp: '25°C' },
  { id: 'rm_3', name: 'Phòng Standard 103 (Chó vừa)', type: 'Standard', capacity: '1 Chó <10kg', occupied: false, pet: null, temp: '24°C' },
  { id: 'rm_4', name: 'Phòng Standard 104 (Chó vừa)', type: 'Standard', capacity: '1 Chó <10kg', occupied: false, pet: null, temp: '24°C' },
]

export default function AdminRoomsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
            Quản lý Phòng / Chuồng Lưu trú (Boarding Rooms)
          </h1>
          <p className="text-xs text-slate-500">Giám sát công suất phòng lưu trú khách sạn thú cưng (Section 3.1 & 23).</p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs">
          + Thêm phòng mới
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {rooms.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-soft flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-500">{r.type}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    r.occupied ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {r.occupied ? 'Đang có thú' : 'Phòng trống'}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base mt-2">{r.name}</h3>
              <p className="text-xs text-slate-500 mt-1">Sức chứa: {r.capacity}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs">
              {r.occupied ? (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-medium">
                  🐾 Đang lưu trú: <strong>{r.pet}</strong>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium text-center">
                  ✓ Sẵn sàng nhận thú cưng
                </div>
              )}
              <p className="text-[10px] text-slate-400 mt-2 text-right">Điều hòa tiệt trùng: {r.temp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
