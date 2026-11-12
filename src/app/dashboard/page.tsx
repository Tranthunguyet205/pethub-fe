'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useMyPets } from '@/hooks/usePetQueries'
import { useBookings } from '@/hooks/useBookingQueries'
import { useFormatters } from '@/hooks/useFormatters'
import StatusBadge from '@/components/common/StatusBadge'

export default function OwnerDashboardPage() {
  const { user, logout } = useAuth()
  const { data: pets } = useMyPets()
  const { data: bookingData } = useBookings()
  const bookings = useMemo(() => bookingData?.data ?? [], [bookingData])
  const { formatVND } = useFormatters()

  const activeBooking = useMemo(() =>
    bookings.find((b) => b.status === 'IN_PROGRESS' || b.status === 'CHECKED_IN'),
    [bookings]
  )

  const upcomingCount = useMemo(() =>
    bookings.filter((b) => b.status === 'PENDING' || b.status === 'CONFIRMED').length,
    [bookings]
  )

  const completedCount = useMemo(() =>
    bookings.filter((b) => b.status === 'COMPLETED').length,
    [bookings]
  )

  const totalSpent = useMemo(() =>
    bookings
      .filter((b) => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + b.bookingServices.reduce((s, svc) => s + svc.price, 0), 0),
    [bookings]
  )

  const recentBookings = useMemo(() => bookings.slice(0, 5), [bookings])

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const getActiveServiceName = useMemo(() => {
    if (!activeBooking) return ''
    const inProgress = activeBooking.bookingServices.find((s) => s.status === 'IN_PROGRESS')
    return inProgress?.service.name ?? activeBooking.bookingType
  }, [activeBooking])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg">
            🐾
          </div>
          <span className="font-bold text-slate-900 text-lg">
            Pet<span className="text-emerald-600">Hub</span>
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <Link href="/bookings" className="text-slate-600 hover:text-emerald-700">Lịch hẹn</Link>
          <Link href="/pets" className="text-slate-600 hover:text-emerald-700">Thú cưng</Link>
          <Link href="/services" className="text-slate-600 hover:text-emerald-700">Dịch vụ</Link>
          <Link href="/profile" className="text-slate-600 hover:text-emerald-700">
            {user?.fullName || 'Hồ sơ'}
          </Link>
          <button onClick={logout} className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer">
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-8">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-card relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider">
              Chào mừng bạn quay trở lại
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
              Bảng điều khiển chăm sóc thú cưng
            </h1>
            <p className="text-sm text-emerald-100 leading-relaxed">
              Theo dõi sức khỏe, tiến trình và lịch sử dịch vụ của các bé cưng nhà bạn tại PetHub.
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              <Link href="/bookings/new" className="px-5 py-2.5 rounded-xl bg-white text-emerald-700 font-bold text-xs shadow-sm hover:bg-emerald-50 transition-all">
                + Đặt lịch hẹn mới
              </Link>
              <Link href="/pets" className="px-5 py-2.5 rounded-xl bg-emerald-700/60 hover:bg-emerald-700 text-white font-semibold text-xs border border-white/20 transition-all">
                Thêm hồ sơ thú cưng
              </Link>
            </div>
          </div>
        </div>

        {/* Active booking banner */}
        {activeBooking && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-soft flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={activeBooking.pet?.avatarUrl ?? ''}
                  alt={activeBooking.pet?.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400"
                />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    {activeBooking.status === 'IN_PROGRESS' ? 'ĐANG CHĂM SÓC TRỰC TIẾP' : 'ĐÃ CHECK-IN'}
                  </span>
                  <StatusBadge status={activeBooking.status} />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {activeBooking.pet?.name} — {getActiveServiceName}
                </h3>
                <p className="text-xs text-slate-600">
                  {activeBooking.bookingType === 'GROOMING' ? 'Grooming' : 'Lưu trú'} • Ngày: {formatDate(activeBooking.expectedCheckInDate)}
                </p>
              </div>
            </div>
            <Link
              href={`/bookings/${activeBooking.id}/timeline`}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              Xem chi tiết →
            </Link>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Thú cưng của tôi</div>
            <div className="text-3xl font-extrabold font-display text-slate-900 mt-2">{pets?.length ?? 0}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lịch hẹn sắp tới</div>
            <div className="text-3xl font-extrabold font-display text-slate-900 mt-2">{upcomingCount}</div>
            {activeBooking && <div className="text-xs text-teal-600 font-medium mt-1">1 đang diễn ra</div>}
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dịch vụ đã hoàn tất</div>
            <div className="text-3xl font-extrabold font-display text-slate-900 mt-2">{completedCount}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng chi tiêu</div>
            <div className="text-2xl font-extrabold font-display text-slate-900 mt-2">{formatVND(totalSpent)}</div>
          </div>
        </div>

        {/* Pet cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 font-display">Hồ sơ thú cưng của bạn</h2>
            <Link href="/pets" className="text-xs font-bold text-emerald-700 hover:text-emerald-800">Xem tất cả →</Link>
          </div>
          {(!pets || pets.length === 0) ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-soft text-center">
              <p className="text-sm text-slate-500 mb-3">Bạn chưa có hồ sơ thú cưng nào.</p>
              <Link href="/pets" className="text-sm font-bold text-emerald-600 hover:underline">+ Tạo hồ sơ thú cưng đầu tiên</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pets.map((pet) => (
                <div key={pet.id} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft hover:shadow-card transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <img src={pet.avatarUrl ?? ''} alt={pet.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-slate-900">{pet.name}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700">{pet.species}</span>
                        </div>
                        <p className="text-xs text-slate-500">{pet.breed}</p>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">{pet.weight} kg</p>
                      </div>
                    </div>
                    {pet.allergyNotes && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 mb-2">
                        <span className="font-bold">Dị ứng:</span> {pet.allergyNotes}
                      </div>
                    )}
                    {pet.specialNotes && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                        <span className="font-bold text-slate-700">Lưu ý:</span> {pet.specialNotes}
                      </div>
                    )}
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link href={`/pets/${pet.id}`} className="text-xs font-bold text-slate-600 hover:text-emerald-600">Chi tiết hồ sơ</Link>
                    <Link href="/bookings/new" className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition-all">
                      Đặt lịch cho {pet.name}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent bookings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 font-display">Lịch hẹn dịch vụ gần đây</h2>
            <Link href="/bookings" className="text-xs font-bold text-emerald-700 hover:text-emerald-800">Xem toàn bộ danh sách →</Link>
          </div>
          {recentBookings.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">Chưa có lịch hẹn nào.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Mã</th>
                    <th className="py-3 px-4">Thú cưng</th>
                    <th className="py-3 px-4">Loại</th>
                    <th className="py-3 px-4">Ngày hẹn</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">#{b.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{b.pet?.name}</td>
                      <td className="py-3.5 px-4">{b.bookingType === 'GROOMING' ? 'Grooming' : 'Lưu trú'}</td>
                      <td className="py-3.5 px-4">{formatDate(b.expectedCheckInDate)}</td>
                      <td className="py-3.5 px-4"><StatusBadge status={b.status} /></td>
                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/bookings/${b.id}/timeline`} className="text-xs font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
