'use client'

import React from 'react'

// Dữ liệu mô phỏng — giữ đồng bộ với pethub-app/app/pages/admin/reviews.vue
const reviews = [
  { id: 'rev_1', pet: 'Coco (Poodle)', owner: 'Nguyễn Bích Ngọc', staff: 'Nguyễn Văn An', service: 'Bath & Blow Dry', rating: 5, date: '15/09/2026', comment: 'Bé Coco được sấy rất tơi lông, thơm lâu và nhân viên cực kỳ nhẹ nhàng!' },
  { id: 'rev_2', pet: 'Milo (Golden)', owner: 'Trần Minh Tuấn', staff: 'Nguyễn Văn An', service: 'Full Grooming', rating: 5, date: '28/08/2026', comment: 'Tỉa form gấu rất đẹp, Milo không bị sợ sệt khi về nhà.' },
  { id: 'rev_3', pet: 'Bông (Samoyed)', owner: 'Lê Văn Hoàng', staff: 'Trần Thị Bích', service: 'Tắm & Vệ sinh', rating: 4, date: '20/08/2026', comment: 'Dịch vụ tốt, thời gian tắm đúng giờ, sẽ quay lại ủng hộ!' },
]

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
            Quản lý Đánh giá & Phản hồi (Reviews & Ratings)
          </h1>
          <p className="text-xs text-slate-500">Đánh giá chất lượng dịch vụ theo từng kỹ thuật viên (Section 19).</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-amber-500 font-bold text-lg">★ 4.8</span>
          <span className="text-xs text-slate-500">Điểm trung bình toàn cơ sở</span>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-900 text-sm">{r.owner}</span>
                <span className="text-xs text-slate-500">
                  {' '}• Đánh giá cho bé <strong className="text-slate-700">{r.pet}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-500 text-sm">★★★★★</span>
                <span className="text-xs text-slate-400 font-mono">{r.date}</span>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100">
              &quot;{r.comment}&quot;
            </p>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>
                Gói: <strong className="text-slate-700">{r.service}</strong>
              </span>
              <span>
                Nhân viên chăm sóc: <strong className="text-indigo-700">{r.staff}</strong>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
