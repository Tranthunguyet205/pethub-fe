'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useDeletePet, useMyPets } from '@/hooks/usePetQueries'
import type { Pet } from '@/types'

const formatGender = (g: string) => (g === 'MALE' ? 'Đực' : g === 'FEMALE' ? 'Cái' : 'Không rõ')

const formatDate = (d: string | null) => {
  if (!d) return 'Chưa rõ'
  return new Date(d).toLocaleDateString('vi-VN')
}

export default function MyPetsPage() {
  const { data: petList, isLoading } = useMyPets()
  const { mutateAsync: deletePet, isPending: isDeleting } = useDeletePet()

  // Toast
  const [toastMessage, setToastMessage] = useState('')
  const showToast = (msg: string, duration = 4000) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), duration)
  }

  // Delete confirm
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null)
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('')

  const openDeleteConfirm = (pet: Pet) => {
    setPetToDelete(pet)
    setDeleteErrorMessage('')
  }

  const handleConfirmDelete = async () => {
    if (!petToDelete?.id) return
    setDeleteErrorMessage('')
    try {
      await deletePet(petToDelete.id)
      showToast(`Đã xóa hồ sơ ${petToDelete.name} thành công!`)
      setPetToDelete(null)
    } catch (err: any) {
      setDeleteErrorMessage(err?.data?.message || err?.message || 'Không thể xóa thú cưng!')
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold">
          <span className="text-base">🎉</span>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="ml-2 text-slate-400 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">Thú cưng của tôi</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Quản lý thông tin chi tiết, tình trạng dị ứng, lưu ý đặc biệt cho từng bé cưng.
          </p>
        </div>
        <Link
          href="/pets/new"
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-soft transition-all flex items-center gap-1.5"
        >
          <span>➕</span>
          <span>Thêm thú cưng mới</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="inline-flex items-center gap-2.5 text-slate-600 font-semibold text-sm">
            <span className="animate-spin text-xl">⏳</span>
            <span>Đang tải danh sách thú cưng...</span>
          </div>
        </div>
      ) : !petList || petList.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🐾</div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Chưa có thú cưng nào</h3>
          <p className="text-sm text-slate-500 mb-6">Hãy thêm bé cưng đầu tiên để bắt đầu đặt lịch chăm sóc!</p>
          <Link
            href="/pets/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-soft transition-all"
          >
            <span>➕</span>
            <span>Thêm thú cưng đầu tiên</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {petList.map((pet) => (
            <div
              key={pet.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Pet header */}
                <div className="flex items-center gap-4">
                  {pet.avatarUrl ? (
                    <img
                      src={pet.avatarUrl}
                      alt={pet.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-3xl">
                      🐾
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-slate-900 truncate">{pet.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700 shrink-0">
                        {pet.species}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{pet.breed || 'Không rõ giống'}</p>
                    <p className="text-xs text-slate-600 font-medium">
                      {pet.weight} kg · {formatGender(pet.gender)}
                    </p>
                  </div>
                </div>

                {/* Info cards */}
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-700">📅 Ngày sinh:</span> {formatDate(pet.birthDate)}
                  </div>
                  {pet.allergyNotes && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                      <span className="font-bold">⚠️ Dị ứng:</span> {pet.allergyNotes}
                    </div>
                  )}
                  {pet.specialNotes && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                      <span className="font-bold">📝 Lưu ý:</span> {pet.specialNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/pets/${pet.id}`}
                    className="text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
                  >
                    ✏️ Chỉnh sửa
                  </Link>
                  <button
                    type="button"
                    onClick={() => openDeleteConfirm(pet)}
                    className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                  >
                    🗑️ Xóa
                  </button>
                </div>
                <Link
                  href="/bookings/new"
                  className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-all"
                >
                  Đặt lịch →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {petToDelete && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) setPetToDelete(null)
          }}
        >
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-100 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-lg shrink-0">
                🗑️
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Xóa hồ sơ thú cưng</h3>
                <p className="text-[11px] text-slate-500">Thao tác này sẽ xóa mềm bé cưng khỏi hệ thống</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa hồ sơ của <strong className="text-slate-900">{petToDelete.name}</strong> (
              {petToDelete.species} - {petToDelete.breed || 'Không rõ giống'})?
            </p>

            {deleteErrorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {deleteErrorMessage}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPetToDelete(null)}
                disabled={isDeleting}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold shadow-soft transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting && <span className="animate-spin text-xs">⏳</span>}
                <span>{isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
