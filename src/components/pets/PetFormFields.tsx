'use client'

import React, { useRef } from 'react'
import type { PetGender } from '@/types'

/**
 * Phần form dùng chung cho tạo mới (/pets/new) và chỉnh sửa (/pets/[id]).
 * Bên Vue hai trang viết lặp lại nhau; ở đây gom về một chỗ cho dễ giữ đồng bộ.
 */
export interface PetFormState {
  name: string
  species: string
  breed: string
  gender: PetGender
  birthDate: string
  weight: number | string
  allergyNotes: string
  specialNotes: string
}

export const MAX_AVATAR_SIZE = 5 * 1024 * 1024

interface Props {
  form: PetFormState
  onChange: (patch: Partial<PetFormState>) => void
  /** Ảnh đang hiển thị: ảnh mới chọn, hoặc ảnh hiện có của pet khi sửa */
  previewUrl: string | null
  hasNewFile: boolean
  onPickFile: (file: File) => void
  onRemoveFile: () => void
  mode: 'create' | 'edit'
}

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500'

export default function PetFormFields({
  form,
  onChange,
  previewUrl,
  hasNewFile,
  onPickFile,
  onRemoveFile,
  mode,
}: Props) {
  const fileInput = useRef<HTMLInputElement | null>(null)
  const isCreate = mode === 'create'

  return (
    <>
      {/* Avatar upload */}
      <div>
        <label className="font-bold text-slate-700 block mb-1.5 text-xs">Ảnh đại diện</label>
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-2xl">
                🐾
              </div>
            )}
          </div>
          <div className="flex-1 space-y-1">
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onPickFile(file)
              }}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                📁 {isCreate ? 'Chọn ảnh' : 'Đổi ảnh'}
              </button>
              {hasNewFile && (
                <button
                  type="button"
                  onClick={() => {
                    onRemoveFile()
                    if (fileInput.current) fileInput.current.value = ''
                  }}
                  className="px-2 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  {isCreate ? '✕ Xóa ảnh' : '✕ Hủy ảnh mới'}
                </button>
              )}
            </div>
            <span className="text-[10px] text-slate-400 block">JPG, PNG, WEBP tối đa 5MB.</span>
          </div>
        </div>
      </div>

      {/* Basic info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1">
            Tên thú cưng <span className="text-rose-500">*</span>
          </label>
          <input
            value={form.name}
            onChange={(e) => onChange({ name: e.target.value })}
            type="text"
            placeholder={isCreate ? 'Ví dụ: Milo, Bông...' : undefined}
            className={inputClass}
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">
            Loài <span className="text-rose-500">*</span>
          </label>
          <input
            value={form.species}
            onChange={(e) => onChange({ species: e.target.value })}
            type="text"
            placeholder={isCreate ? 'Chó, Mèo, Hamster...' : undefined}
            className={inputClass}
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Giống (Breed)</label>
          <input
            value={form.breed}
            onChange={(e) => onChange({ breed: e.target.value })}
            type="text"
            placeholder={isCreate ? 'Golden, Poodle, Mèo Anh...' : undefined}
            className={inputClass}
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Giới tính</label>
          <select
            value={form.gender}
            onChange={(e) => onChange({ gender: e.target.value as PetGender })}
            className={inputClass}
          >
            <option value="MALE">Đực (Male)</option>
            <option value="FEMALE">Cái (Female)</option>
            <option value="UNKNOWN">Không rõ</option>
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">
            Cân nặng (kg) {isCreate && <span className="text-rose-500">*</span>}
          </label>
          <input
            value={form.weight}
            onChange={(e) => onChange({ weight: e.target.value })}
            type="number"
            step="0.1"
            min="0"
            className={inputClass}
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Ngày sinh</label>
          <input
            value={form.birthDate}
            onChange={(e) => onChange({ birthDate: e.target.value })}
            type="date"
            className={inputClass}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-4 text-xs border-t border-slate-100 pt-4">
        <div>
          <label className="font-bold text-rose-700 block mb-1">
            {isCreate ? '⚠️ Tiền sử dị ứng (nếu có):' : '⚠️ Tiền sử dị ứng:'}
          </label>
          <input
            value={form.allergyNotes}
            onChange={(e) => onChange({ allergyNotes: e.target.value })}
            type="text"
            placeholder={isCreate ? 'Ví dụ: Dị ứng thịt gà, dị ứng xà phòng thơm...' : undefined}
            className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-rose-50/40 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
          />
        </div>

        <div>
          <label className="font-bold text-amber-800 block mb-1">
            {isCreate ? '📝 Lưu ý đặc biệt cho nhân viên:' : '📝 Lưu ý đặc biệt:'}
          </label>
          <textarea
            value={form.specialNotes}
            onChange={(e) => onChange({ specialNotes: e.target.value })}
            rows={2}
            placeholder={isCreate ? 'Ví dụ: Bé sợ máy sấy công suất lớn, không thích đụng vào đuôi...' : undefined}
            className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 bg-amber-50/40 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>
    </>
  )
}

/** Chuẩn hóa form → payload gửi backend (chuỗi rỗng thành undefined) */
export function toPetPayload(form: PetFormState, avatar: File | null) {
  return {
    name: form.name.trim(),
    species: form.species.trim(),
    breed: form.breed.trim() || undefined,
    gender: form.gender,
    birthDate: form.birthDate || undefined,
    weight: Number(form.weight),
    allergyNotes: form.allergyNotes.trim() || undefined,
    specialNotes: form.specialNotes.trim() || undefined,
    avatar: avatar || undefined,
  }
}
