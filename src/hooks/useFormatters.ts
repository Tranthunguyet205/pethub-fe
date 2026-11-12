import type { BookingStatus } from '@/types'

export function useFormatters() {
  const formatVND = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const getStatusBadge = (status: BookingStatus) => {
    const map: Record<string, { label: string; className: string }> = {
      PENDING: { label: 'Chờ xác nhận', className: 'bg-amber-100 text-amber-800 border-amber-300' },
      CONFIRMED: { label: 'Đã xác nhận', className: 'bg-blue-100 text-blue-800 border-blue-300' },
      CHECKED_IN: { label: 'Đã Check-in', className: 'bg-purple-100 text-purple-800 border-purple-300' },
      IN_PROGRESS: { label: 'Đang chăm sóc', className: 'bg-teal-100 text-teal-800 border-teal-300' },
      COMPLETED: { label: 'Hoàn thành', className: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
      CANCELLED: { label: 'Đã hủy', className: 'bg-rose-100 text-rose-800 border-rose-300' },
      NO_SHOW: { label: 'Vắng mặt', className: 'bg-slate-100 text-slate-800 border-slate-300' },
    }
    return map[status] ?? { label: status, className: 'bg-gray-100 text-gray-800 border-gray-300' }
  }

  return { formatVND, getStatusBadge }
}
