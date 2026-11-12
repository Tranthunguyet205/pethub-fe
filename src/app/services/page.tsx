'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useServices } from '@/hooks/useServiceQueries'
import { useFormatters } from '@/hooks/useFormatters'

const SYSTEM_CATEGORIES = ['CHECK_IN', 'CHECK_OUT']

type CategoryFilter = 'ALL' | string

export default function ServicesPage() {
  const { data: serviceData } = useServices()
  const allServices = useMemo(
    () => (serviceData?.data ?? []).filter((s) => !SYSTEM_CATEGORIES.includes(s.category)),
    [serviceData]
  )
  const { formatVND } = useFormatters()

  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL')

  const filteredServices = useMemo(() => {
    if (activeCategory === 'ALL') return allServices
    return allServices.filter((s) => s.category === activeCategory)
  }, [allServices, activeCategory])

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900">
          Bảng giá Dịch vụ Chăm sóc Thú cưng
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Trang bị đầy đủ trang thiết bị spa chuyên nghiệp, phòng lạnh tiệt trùng và các dòng mỹ phẩm hữu cơ cao cấp.
        </p>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {[
            { key: 'ALL', label: `Tất cả (${allServices.length})` },
            { key: 'GROOMING', label: '✂️ Grooming & Spa' },
            { key: 'BOARDING', label: '🏠 Khách sạn thú cưng' },
            { key: 'WALKING', label: '🦮 Đi dạo & Vận động' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === tab.key
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Service Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-48 overflow-hidden relative">
                <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-white/95 px-3 py-1 rounded-xl text-xs font-bold text-slate-800 shadow-sm">
                  ⏱ {service.durationMinutes} phút
                </div>
                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-0.5 rounded-lg text-[11px] font-medium">
                  {service.category}
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-bold text-lg text-slate-900">{service.name}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{service.description}</p>

                {/* Add-ons */}
                {service.addons && service.addons.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Dịch vụ cộng thêm (Add-ons):
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {service.addons.map((addon: any) => (
                        <li key={addon.id} className="flex items-center justify-between">
                          <span>+ {addon.name}</span>
                          <span className="font-semibold text-slate-800">{formatVND(addon.price)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 pt-0">
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Đơn giá niêm yết</span>
                  <span className="text-xl font-bold font-display text-brand-700">
                    {formatVND(service.basePrice)}
                  </span>
                </div>
                <Link
                  href="/bookings/new"
                  className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all"
                >
                  Chọn dịch vụ →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
