'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCreatePet } from '@/hooks/usePetQueries'
import PetFormFields, { MAX_AVATAR_SIZE, toPetPayload, type PetFormState } from '@/components/pets/PetFormFields'

const initialForm: PetFormState = {
  name: '',
  species: 'Chó',
  breed: '',
  gender: 'MALE',
  birthDate: '',
  weight: 5.0,
  allergyNotes: '',
  specialNotes: '',
}

export default function NewPetPage() {
  const router = useRouter()
  const { mutateAsync: createPet, isPending: isCreating } = useCreatePet()

  const [form, setForm] = useState<PetFormState>(initialForm)
  const [errorMessage, setErrorMessage] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')

  // Giải phóng object URL của ảnh xem trước khi đổi ảnh / rời trang
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

  const canSubmit = !!form.name.trim() && !!form.species.trim()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) {
      setErrorMessage('Vui lòng điền tên và loài thú cưng.')
      return
    }
    setErrorMessage('')

    try {
      await createPet(toPetPayload(form, avatarFile))
      router.push('/pets')
    } catch (err: any) {
      setErrorMessage(err?.data?.message || err?.message || 'Có lỗi xảy ra khi tạo hồ sơ!')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/pets"
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
        >
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Tạo hồ sơ Thú cưng mới</h1>
          <p className="text-xs text-slate-500">Thông tin này sẽ được kỹ thuật viên tham khảo khi check-in.</p>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6"
      >
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <PetFormFields
          mode="create"
          form={form}
          onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          previewUrl={avatarPreview || null}
          hasNewFile={!!avatarFile}
          onPickFile={handlePickFile}
          onRemoveFile={handleRemoveFile}
        />

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            href="/pets"
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
          >
            Hủy bỏ
          </Link>
          <button
            type="submit"
            disabled={isCreating || !canSubmit}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs shadow-soft transition-all flex items-center gap-2 cursor-pointer"
          >
            {isCreating && <span className="animate-spin text-sm">⏳</span>}
            <span>{isCreating ? 'Đang lưu...' : 'Lưu hồ sơ'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
