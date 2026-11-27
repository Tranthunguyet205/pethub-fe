'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useDeletePet, usePetDetail, useUpdatePet } from '@/hooks/usePetQueries'
import PetFormFields, { MAX_AVATAR_SIZE, toPetPayload, type PetFormState } from '@/components/pets/PetFormFields'

const formatGender = (g: string) => (g === 'MALE' ? 'Đực' : g === 'FEMALE' ? 'Cái' : 'Không rõ')

const formatDate = (d: string | null) => {
  if (!d) return 'Chưa rõ'
  return new Date(d).toLocaleDateString('vi-VN')
}

export default function PetDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const petId = Number(params.id)

  const { data: pet, isLoading } = usePetDetail(petId)
  const { mutateAsync: updatePet, isPending: isUpdating } = useUpdatePet()
  const { mutateAsync: deletePet, isPending: isDeleting } = useDeletePet()

  // Edit mode
  const [isEditing, setIsEditing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [form, setForm] = useState<PetFormState>({
    name: '',
    species: '',
    breed: '',
    gender: 'MALE',
    birthDate: '',
    weight: 0,
    allergyNotes: '',
    specialNotes: '',
  })

  // Avatar upload
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

  const handlePickFile = (file: File) => {
    if (file.size > MAX_AVATAR_SIZE) {
      setErrorMessage('Dung lượng ảnh vượt quá 5MB.')
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setErrorMessage('')
  }

  const handleRemoveFile = () => {
    setAvatarFile(null)
    setAvatarPreview('')
  }

  const startEditing = () => {
    if (!pet) return
    setForm({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      gender: pet.gender,
      birthDate: pet.birthDate ? pet.birthDate.split('T')[0] : '',
      weight: pet.weight,
      allergyNotes: pet.allergyNotes || '',
      specialNotes: pet.specialNotes || '',
    })
    setAvatarFile(null)
    setAvatarPreview('')
    setErrorMessage('')
    setSuccessMessage('')
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setErrorMessage('')
  }

  const canSubmit = !!form.name.trim() && !!form.species.trim()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) {
      setErrorMessage('Vui lòng điền tên và loài thú cưng.')
      return
    }
    setErrorMessage('')

    try {
      await updatePet({ id: petId, data: toPetPayload(form, avatarFile) })
      setIsEditing(false)
      setSuccessMessage('Đã cập nhật thông tin thành công!')
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (err: any) {
      setErrorMessage(err?.data?.message || err?.message || 'Có lỗi xảy ra!')
    }
  }

  // Delete confirm
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('')

  const handleConfirmDelete = async () => {
    setDeleteErrorMessage('')
    try {
      await deletePet(petId)
      router.push('/pets')
    } catch (err: any) {
      setDeleteErrorMessage(err?.data?.message || err?.message || 'Không thể xóa!')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/pets"
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
        >
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Chi tiết Hồ sơ Thú cưng</h1>
          <p className="text-xs text-slate-500">Mã định danh hệ thống: #{petId}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="inline-flex items-center gap-2.5 text-slate-600 font-semibold text-sm">
            <span className="animate-spin text-xl">⏳</span>
            <span>Đang tải thông tin...</span>
          </div>
        </div>
      ) : !pet ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">😿</div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Không tìm thấy thú cưng</h3>
          <p className="text-sm text-slate-500 mb-6">Thú cưng này không tồn tại hoặc đã bị xóa.</p>
          <Link href="/pets" className="text-sm font-bold text-brand-600 hover:text-brand-700">
            ← Quay lại danh sách
          </Link>
        </div>
      ) : (
        <>
          {/* Success toast */}
          {successMessage && (
            <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold">
              <span className="text-base">🎉</span>
              <span>{successMessage}</span>
              <button
                onClick={() => setSuccessMessage('')}
                className="ml-2 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {!isEditing ? (
            /* VIEW MODE */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-8">
              <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-slate-100">
                {pet.avatarUrl ? (
                  <img
                    src={pet.avatarUrl}
                    alt={pet.name}
                    className="w-24 h-24 rounded-3xl object-cover border-2 border-slate-200 shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-3xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-4xl">
                    🐾
                  </div>
                )}

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-extrabold text-slate-900 font-display">{pet.name}</h2>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                      {pet.species}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {pet.breed || 'Không rõ giống'} · {formatGender(pet.gender)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Cân nặng: <strong className="text-slate-800">{pet.weight} kg</strong> · Ngày sinh:{' '}
                    {formatDate(pet.birthDate)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={startEditing}
                    className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-soft transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    ✏️ Chỉnh sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteErrorMessage('')
                      setIsDeleteModalOpen(true)
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
                  <h3 className="font-bold text-sm text-rose-900 flex items-center gap-2">⚠️ Cảnh báo Dị ứng (Allergy)</h3>
                  <p className="text-rose-800 leading-relaxed">{pet.allergyNotes || 'Chưa ghi nhận dị ứng cụ thể.'}</p>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                  <h3 className="font-bold text-sm text-amber-900 flex items-center gap-2">📝 Lưu ý đặc biệt khi chăm sóc</h3>
                  <p className="text-amber-800 leading-relaxed">{pet.specialNotes || 'Không có lưu ý đặc biệt.'}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Link
                  href={`/bookings/new?petId=${pet.id}`}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-soft hover:bg-brand-700 transition-all flex items-center gap-1.5"
                >
                  📅 Đặt lịch cho {pet.name}
                </Link>
              </div>
            </div>
          ) : (
            /* EDIT MODE */
            <form
              onSubmit={handleUpdate}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold font-display text-slate-900">Chỉnh sửa: {pet.name}</h2>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  ✕ Hủy chỉnh sửa
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              <PetFormFields
                mode="edit"
                form={form}
                onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
                previewUrl={avatarPreview || pet.avatarUrl}
                hasNewFile={!!avatarFile}
                onPickFile={handlePickFile}
                onRemoveFile={handleRemoveFile}
              />

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || !canSubmit}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs shadow-soft transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isUpdating && <span className="animate-spin text-sm">⏳</span>}
                  <span>{isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {/* Delete Confirm Modal */}
      {isDeleteModalOpen && pet && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) setIsDeleteModalOpen(false)
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
              Bạn có chắc chắn muốn xóa hồ sơ của <strong className="text-slate-900">{pet.name}</strong> ({pet.species} -{' '}
              {pet.breed || 'Không rõ giống'})?
            </p>

            {deleteErrorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {deleteErrorMessage}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
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
