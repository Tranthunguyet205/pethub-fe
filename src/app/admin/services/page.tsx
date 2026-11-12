'use client'

import React, { useState, useMemo, useRef } from 'react'
import { useServices, useCreateService, useUpdateService, useDeleteService } from '@/hooks/useServiceQueries'
import { useFormatters } from '@/hooks/useFormatters'
import type { Service, ServiceCategory, GetAllServiceParams, CreateServiceDto, UpdateServiceDto } from '@/types'

type ServiceCategoryGroup = 'RECEPTION' | 'GROOMING' | 'BOARDING_CARE'

const categoryLabels: Record<ServiceCategory, string> = {
  CHECK_IN: 'Check-in',
  CHECK_OUT: 'Check-out',
  BATH_AND_DRY: 'Tắm & Sấy',
  HAIRCUT: 'Cắt tỉa lông',
  HYGIENE: 'Vệ sinh',
  FULL_GROOMING: 'Grooming trọn gói',
  ASSIGN_ROOM: 'Bố trí phòng',
  FEEDING: 'Cho ăn',
  WATER: 'Cấp nước',
  WALKING: 'Dắt dạo',
  MEDICATION: 'Thuốc',
  CLEANING: 'Vệ sinh chuồng',
  DAILY_HEALTH_CHECK: 'Kiểm tra SK',
}

const categoryColors: Record<ServiceCategory, { bg: string; text: string }> = {
  CHECK_IN: { bg: 'bg-sky-100', text: 'text-sky-800' },
  CHECK_OUT: { bg: 'bg-sky-100', text: 'text-sky-800' },
  BATH_AND_DRY: { bg: 'bg-pink-100', text: 'text-pink-800' },
  HAIRCUT: { bg: 'bg-violet-100', text: 'text-violet-800' },
  HYGIENE: { bg: 'bg-teal-100', text: 'text-teal-800' },
  FULL_GROOMING: { bg: 'bg-amber-100', text: 'text-amber-800' },
  ASSIGN_ROOM: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  FEEDING: { bg: 'bg-orange-100', text: 'text-orange-800' },
  WATER: { bg: 'bg-cyan-100', text: 'text-cyan-800' },
  WALKING: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  MEDICATION: { bg: 'bg-rose-100', text: 'text-rose-800' },
  CLEANING: { bg: 'bg-lime-100', text: 'text-lime-800' },
  DAILY_HEALTH_CHECK: { bg: 'bg-blue-100', text: 'text-blue-800' },
}

const categoryIcons: Record<ServiceCategory, string> = {
  CHECK_IN: '📋',
  CHECK_OUT: '🏁',
  BATH_AND_DRY: '🛁',
  HAIRCUT: '✂️',
  HYGIENE: '🪥',
  FULL_GROOMING: '✨',
  ASSIGN_ROOM: '🏠',
  FEEDING: '🍖',
  WATER: '💧',
  WALKING: '🐕‍🦺',
  MEDICATION: '💊',
  CLEANING: '🧹',
  DAILY_HEALTH_CHECK: '🩺',
}

const groupConfig: Record<ServiceCategoryGroup, {
  label: string
  icon: string
  categories: ServiceCategory[]
  colorActive: string
  colorText: string
}> = {
  RECEPTION: {
    label: 'Lễ tân',
    icon: '🏪',
    categories: ['CHECK_IN', 'CHECK_OUT'],
    colorActive: 'bg-sky-50/50 border-sky-300 ring-2 ring-sky-400/20',
    colorText: 'text-sky-700',
  },
  GROOMING: {
    label: 'Grooming',
    icon: '✂️',
    categories: ['BATH_AND_DRY', 'HAIRCUT', 'HYGIENE', 'FULL_GROOMING'],
    colorActive: 'bg-pink-50/50 border-pink-300 ring-2 ring-pink-400/20',
    colorText: 'text-pink-700',
  },
  BOARDING_CARE: {
    label: 'Chăm sóc nội trú',
    icon: '🏠',
    categories: ['ASSIGN_ROOM', 'FEEDING', 'WATER', 'WALKING', 'MEDICATION', 'CLEANING', 'DAILY_HEALTH_CHECK'],
    colorActive: 'bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-400/20',
    colorText: 'text-indigo-700',
  },
}

const getGroupOf = (cat: ServiceCategory): ServiceCategoryGroup => {
  if (groupConfig.RECEPTION.categories.includes(cat)) return 'RECEPTION'
  if (groupConfig.GROOMING.categories.includes(cat)) return 'GROOMING'
  return 'BOARDING_CARE'
}

const isSystemCategory = (cat: ServiceCategory) => cat === 'CHECK_IN' || cat === 'CHECK_OUT'

export default function AdminServicesPage() {
  const { formatVND } = useFormatters()

  const [activeGroup, setActiveGroup] = useState<'ALL' | ServiceCategoryGroup>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  const queryParams = useMemo<GetAllServiceParams>(() => ({
    page,
    limit: 50,
    search: searchQuery.trim() || undefined,
  }), [page, searchQuery])

  const { data: response, isLoading } = useServices(queryParams)
  const { mutateAsync: createService, isPending: isCreating } = useCreateService()
  const { mutateAsync: updateService, isPending: isUpdating } = useUpdateService()
  const { mutateAsync: deleteService, isPending: isDeleting } = useDeleteService()

  const allServices = useMemo(() => response?.data ?? [], [response])

  const filteredServices = useMemo(() => {
    if (activeGroup === 'ALL') return allServices
    const cats = groupConfig[activeGroup].categories
    return allServices.filter((s) => cats.includes(s.category))
  }, [allServices, activeGroup])

  const stats = useMemo(() => ({
    total: allServices.length,
    reception: allServices.filter((s) => groupConfig.RECEPTION.categories.includes(s.category)).length,
    grooming: allServices.filter((s) => groupConfig.GROOMING.categories.includes(s.category)).length,
    boarding: allServices.filter((s) => groupConfig.BOARDING_CARE.categories.includes(s.category)).length,
  }), [allServices])

  const [toastMessage, setToastMessage] = useState('')
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 4000)
  }

  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const openDetail = (s: Service) => {
    setSelectedService(s)
    setIsDetailOpen(true)
  }

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    basePrice: 0,
    durationMinutes: 15,
    category: 'BATH_AND_DRY' as ServiceCategory,
  })

  const imageFileInput = useRef<HTMLInputElement>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')

  const resetCreateForm = () => {
    setCreateForm({ name: '', description: '', basePrice: 0, durationMinutes: 15, category: 'BATH_AND_DRY' })
    setImageFile(null)
    setImagePreview('')
    setCreateError('')
    if (imageFileInput.current) imageFileInput.current.value = ''
  }

  const openCreateModal = () => {
    resetCreateForm()
    setIsCreateOpen(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setCreateError('Dung lượng ảnh vượt quá 5MB.')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setCreateError('')
  }

  const removeImageFile = () => {
    setImageFile(null)
    setImagePreview('')
    if (imageFileInput.current) imageFileInput.current.value = ''
  }

  const handleCreateService = async () => {
    if (!createForm.name.trim() || !createForm.description.trim()) {
      setCreateError('Vui lòng điền đầy đủ tên và mô tả dịch vụ.')
      return
    }
    setCreateError('')
    try {
      const dto: CreateServiceDto = {
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        basePrice: createForm.basePrice,
        durationMinutes: createForm.durationMinutes,
        category: createForm.category,
        image: imageFile || undefined,
      }
      await createService(dto)
      showToast(`Đã tạo dịch vụ "${createForm.name}" thành công!`)
      setIsCreateOpen(false)
      resetCreateForm()
    } catch (err: any) {
      setCreateError(err?.data?.message || err?.message || 'Có lỗi xảy ra khi tạo dịch vụ!')
    }
  }

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editError, setEditError] = useState('')
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    basePrice: 0,
    durationMinutes: 15,
  })

  const editImageFileInput = useRef<HTMLInputElement>(null)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState('')

  const openEditModal = (s: Service) => {
    setServiceToEdit(s)
    setEditForm({
      name: s.name,
      description: s.description || '',
      basePrice: s.basePrice,
      durationMinutes: s.durationMinutes,
    })
    setEditImageFile(null)
    setEditImagePreview(s.imageUrl || '')
    setEditError('')
    setIsDetailOpen(false)
    setIsEditOpen(true)
  }

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setEditError('Dung lượng ảnh vượt quá 5MB.')
      return
    }
    setEditImageFile(file)
    setEditImagePreview(URL.createObjectURL(file))
    setEditError('')
  }

  const removeEditImageFile = () => {
    setEditImageFile(null)
    setEditImagePreview(serviceToEdit?.imageUrl || '')
    if (editImageFileInput.current) editImageFileInput.current.value = ''
  }

  const handleUpdateService = async () => {
    if (!serviceToEdit) return
    if (!editForm.name.trim()) {
      setEditError('Tên dịch vụ không được để trống.')
      return
    }
    setEditError('')
    const original = serviceToEdit
    const payload: UpdateServiceDto = {}
    if (editForm.name.trim() !== original.name) payload.name = editForm.name.trim()
    if (editForm.description.trim() !== (original.description || '')) payload.description = editForm.description.trim()
    if (editForm.basePrice !== original.basePrice) payload.basePrice = editForm.basePrice
    if (editForm.durationMinutes !== original.durationMinutes) payload.durationMinutes = editForm.durationMinutes
    if (editImageFile) payload.image = editImageFile

    if (Object.keys(payload).length === 0) {
      setIsEditOpen(false)
      return
    }

    try {
      await updateService({ id: original.id, data: payload })
      showToast(`Đã cập nhật dịch vụ "${editForm.name}" thành công!`)
      setIsEditOpen(false)
      setServiceToEdit(null)
    } catch (err: any) {
      setEditError(err?.data?.message || err?.message || 'Có lỗi xảy ra khi cập nhật!')
    }
  }

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)
  const [deleteError, setDeleteError] = useState('')

  const openDeleteConfirm = (s: Service) => {
    setServiceToDelete(s)
    setDeleteError('')
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return
    setDeleteError('')
    try {
      await deleteService(serviceToDelete.id)
      showToast(`Đã xóa dịch vụ "${serviceToDelete.name}" thành công!`)
      setIsDeleteOpen(false)
      setServiceToDelete(null)
    } catch (err: any) {
      setDeleteError(err?.data?.message || err?.message || 'Không thể xóa dịch vụ!')
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold animate-in fade-in">
          <span className="text-base">🎉</span>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="ml-2 text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
            Danh mục Dịch vụ & Bảng giá
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cấu hình giá niêm yết, thời lượng ước tính và phân loại dịch vụ theo nhóm nghiệp vụ.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-soft transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>➕</span>
          <span>Thêm dịch vụ mới</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveGroup('ALL')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeGroup === 'ALL'
              ? 'bg-purple-50/50 border-purple-300 ring-2 ring-purple-400/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng dịch vụ</div>
          <div className="text-2xl font-extrabold font-display text-slate-900 mt-1">{stats.total}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Tất cả danh mục</div>
        </div>

        {(['RECEPTION', 'GROOMING', 'BOARDING_CARE'] as ServiceCategoryGroup[]).map((g) => (
          <div
            key={g}
            onClick={() => setActiveGroup(g)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeGroup === g
                ? groupConfig[g].colorActive
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${groupConfig[g].colorText}`}>
              <span>{groupConfig[g].icon}</span> {groupConfig[g].label}
            </div>
            <div className={`text-2xl font-extrabold font-display mt-1 ${groupConfig[g].colorText}`}>
              {g === 'RECEPTION' ? stats.reception : g === 'GROOMING' ? stats.grooming : stats.boarding}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {g === 'RECEPTION' ? 'Check-in / Check-out' : g === 'GROOMING' ? 'Tắm, cắt tỉa, vệ sinh' : 'Phòng, ăn, dạo, thuốc...'}
            </div>
          </div>
        ))}
      </div>

      {/* Search & Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">🔍</span>
            <input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
              type="text"
              placeholder="Tìm theo tên dịch vụ, mô tả..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs w-full sm:w-auto overflow-x-auto">
            {([
              { key: 'ALL' as const, label: `Tất cả (${stats.total})`, activeClass: 'bg-white text-slate-900 shadow-xs' },
              { key: 'RECEPTION' as const, label: `Lễ tân (${stats.reception})`, activeClass: 'bg-white text-sky-800 shadow-xs' },
              { key: 'GROOMING' as const, label: `Grooming (${stats.grooming})`, activeClass: 'bg-white text-pink-800 shadow-xs' },
              { key: 'BOARDING_CARE' as const, label: `Nội trú (${stats.boarding})`, activeClass: 'bg-white text-indigo-800 shadow-xs' },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveGroup(tab.key)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeGroup === tab.key ? tab.activeClass : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Dịch vụ</th>
                <th className="py-3 px-4">Danh mục</th>
                <th className="py-3 px-4">Nhóm</th>
                <th className="py-3 px-4">Thời lượng</th>
                <th className="py-3 px-4">Đơn giá</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2.5 text-slate-600 font-semibold text-xs">
                      <span className="animate-spin text-base">⏳</span>
                      <span>Đang tải danh sách dịch vụ...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && filteredServices.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="text-3xl mb-2">🔍</div>
                    <div className="font-bold text-slate-600 text-sm">Không tìm thấy dịch vụ phù hợp</div>
                    <div className="text-xs mt-1">Thử thay đổi từ khóa hoặc bộ lọc nhóm</div>
                  </td>
                </tr>
              )}

              {!isLoading && filteredServices.map((s) => {
                const group = getGroupOf(s.category)
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {s.imageUrl ? (
                          <img src={s.imageUrl} alt={s.name} className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-base shrink-0">
                            {categoryIcons[s.category]}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900">{s.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: #{s.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1 ${categoryColors[s.category].bg} ${categoryColors[s.category].text}`}>
                        <span>{categoryIcons[s.category]}</span>
                        <span>{categoryLabels[s.category]}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-semibold ${group === 'RECEPTION' ? 'text-sky-700' : group === 'GROOMING' ? 'text-pink-700' : 'text-indigo-700'}`}>
                        {groupConfig[group].icon} {groupConfig[group].label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {s.durationMinutes >= 1440
                        ? `${Math.floor(s.durationMinutes / 1440)} ngày`
                        : `${s.durationMinutes} phút`}
                    </td>
                    <td className="py-3.5 px-4 font-bold font-mono">
                      {s.basePrice === 0 ? (
                        <span className="text-slate-400 italic font-normal">Miễn phí</span>
                      ) : (
                        <span className="text-emerald-700">{formatVND(s.basePrice)}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {isSystemCategory(s.category) ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          Hệ thống
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Hoạt động
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openDetail(s)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 hover:text-purple-700 text-slate-700 font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>👁️</span><span>Chi tiết</span>
                        </button>
                        {!isSystemCategory(s.category) && (
                          <>
                            <button
                              onClick={() => openEditModal(s)}
                              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span>✏️</span><span>Sửa</span>
                            </button>
                            <button
                              onClick={() => openDeleteConfirm(s)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span>🗑️</span><span>Xóa</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="p-6 bg-gradient-to-r from-purple-50 via-pink-50/50 to-white border-b border-slate-200 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-lg shadow-soft">✨</div>
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-900">Thêm dịch vụ mới</h3>
                  <p className="text-xs text-slate-500">Tạo dịch vụ và cấu hình giá niêm yết, thời lượng</p>
                </div>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer">✕</button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {createError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <span>⚠️</span><span>{createError}</span>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-2">1. Chọn danh mục dịch vụ <span className="text-rose-500">*</span></label>
                <div className="mb-3">
                  <div className="text-[10px] font-bold text-pink-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <span>✂️</span> Grooming
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {groupConfig.GROOMING.categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCreateForm({ ...createForm, category: cat })}
                        className={`px-3 py-1.5 rounded-xl border-2 font-bold text-[11px] transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                          createForm.category === cat
                            ? 'border-pink-500 bg-pink-50 text-pink-800 ring-2 ring-pink-500/20'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <span>{categoryIcons[cat]}</span>
                        <span>{categoryLabels[cat]}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <span>🏠</span> Chăm sóc nội trú
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {groupConfig.BOARDING_CARE.categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCreateForm({ ...createForm, category: cat })}
                        className={`px-3 py-1.5 rounded-xl border-2 font-bold text-[11px] transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                          createForm.category === cat
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <span>{categoryIcons[cat]}</span>
                        <span>{categoryLabels[cat]}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">* CHECK_IN / CHECK_OUT là dịch vụ hệ thống cố định, không thể tạo mới.</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">2. Ảnh minh họa</label>
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-xs" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xl">📷</div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <input ref={imageFileInput} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => imageFileInput.current?.click()} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer">
                        📁 Chọn ảnh
                      </button>
                      {imageFile && (
                        <button type="button" onClick={removeImageFile} className="px-2 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-[11px] font-semibold transition-colors cursor-pointer">
                          ✕ Xóa ảnh
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block">JPG, PNG, WEBP tối đa 5MB.</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">3. Tên dịch vụ <span className="text-rose-500">*</span></label>
                  <input
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    type="text"
                    placeholder="Ví dụ: Tắm & Sấy Cao Cấp"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mô tả chi tiết <span className="text-rose-500">*</span></label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    rows={3}
                    placeholder="Mô tả quy trình thực hiện dịch vụ..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Đơn giá (VNĐ) <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <input
                        value={createForm.basePrice}
                        onChange={(e) => setCreateForm({ ...createForm, basePrice: Number(e.target.value) })}
                        type="number"
                        min={0}
                        step={1000}
                        className="w-full pl-3.5 pr-12 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs font-mono"
                      />
                      <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 text-[10px] font-bold">VNĐ</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Nhập 0 nếu miễn phí</span>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Thời lượng (phút) <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <input
                        value={createForm.durationMinutes}
                        onChange={(e) => setCreateForm({ ...createForm, durationMinutes: Number(e.target.value) })}
                        type="number"
                        min={1}
                        step={5}
                        className="w-full pl-3.5 pr-12 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs font-mono"
                      />
                      <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 text-[10px] font-bold">phút</span>
                    </div>
                  </div>
                </div>
              </div>

              {createForm.name.trim() && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Xem trước</div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1 ${categoryColors[createForm.category].bg} ${categoryColors[createForm.category].text}`}>
                      <span>{categoryIcons[createForm.category]}</span>
                      <span>{categoryLabels[createForm.category]}</span>
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs">{createForm.name}</div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    <span className="font-mono">{createForm.durationMinutes} phút</span>
                    <span>·</span>
                    {createForm.basePrice === 0 ? (
                      <span className="italic">Miễn phí</span>
                    ) : (
                      <span className="font-mono text-emerald-700 font-bold">{formatVND(createForm.basePrice)}</span>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer">
                  Hủy bỏ
                </button>
                <button
                  onClick={handleCreateService}
                  disabled={isCreating}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-soft transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isCreating && <span className="animate-spin text-sm">⏳</span>}
                  <span>{isCreating ? 'Đang tạo...' : 'Tạo dịch vụ'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && serviceToEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={() => setIsEditOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="p-6 bg-gradient-to-r from-purple-50 via-amber-50/50 to-white border-b border-slate-200 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-lg shadow-soft">✏️</div>
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-900">Chỉnh sửa dịch vụ</h3>
                  <p className="text-xs text-slate-500">
                    <span className={categoryColors[serviceToEdit.category].text}>
                      {categoryIcons[serviceToEdit.category]} {categoryLabels[serviceToEdit.category]}
                    </span>
                    {' '}· ID #{serviceToEdit.id}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsEditOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer">✕</button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {editError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <span>⚠️</span><span>{editError}</span>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Ảnh minh họa</label>
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    {editImagePreview ? (
                      <img src={editImagePreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-xs" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xl">
                        {categoryIcons[serviceToEdit.category]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <input ref={editImageFileInput} type="file" accept="image/*" onChange={handleEditImageChange} className="hidden" />
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => editImageFileInput.current?.click()} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer">
                        📁 Đổi ảnh
                      </button>
                      {editImageFile && (
                        <button type="button" onClick={removeEditImageFile} className="px-2 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-[11px] font-semibold transition-colors cursor-pointer">
                          ✕ Hủy đổi
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block">JPG, PNG, WEBP tối đa 5MB.</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tên dịch vụ <span className="text-rose-500">*</span></label>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    type="text"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mô tả chi tiết</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Đơn giá (VNĐ) <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <input
                        value={editForm.basePrice}
                        onChange={(e) => setEditForm({ ...editForm, basePrice: Number(e.target.value) })}
                        type="number"
                        min={0}
                        step={1000}
                        className="w-full pl-3.5 pr-12 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs font-mono"
                      />
                      <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 text-[10px] font-bold">VNĐ</span>
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Thời lượng (phút) <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <input
                        value={editForm.durationMinutes}
                        onChange={(e) => setEditForm({ ...editForm, durationMinutes: Number(e.target.value) })}
                        type="number"
                        min={1}
                        step={5}
                        className="w-full pl-3.5 pr-12 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs font-mono"
                      />
                      <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 text-[10px] font-bold">phút</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">So sánh thay đổi</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                  <div>
                    <span className="text-slate-400">Giá cũ:</span>
                    <span className="font-mono font-bold ml-1">{formatVND(serviceToEdit.basePrice)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Giá mới:</span>
                    <span className={`font-mono font-bold ml-1 ${editForm.basePrice !== serviceToEdit.basePrice ? 'text-emerald-700' : ''}`}>
                      {formatVND(editForm.basePrice)}
                    </span>
                    {editForm.basePrice !== serviceToEdit.basePrice && <span className="text-amber-600 ml-1">*</span>}
                  </div>
                  <div>
                    <span className="text-slate-400">TL cũ:</span>
                    <span className="font-mono font-bold ml-1">{serviceToEdit.durationMinutes} phút</span>
                  </div>
                  <div>
                    <span className="text-slate-400">TL mới:</span>
                    <span className={`font-mono font-bold ml-1 ${editForm.durationMinutes !== serviceToEdit.durationMinutes ? 'text-emerald-700' : ''}`}>
                      {editForm.durationMinutes} phút
                    </span>
                    {editForm.durationMinutes !== serviceToEdit.durationMinutes && <span className="text-amber-600 ml-1">*</span>}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button onClick={() => setIsEditOpen(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer">
                  Hủy bỏ
                </button>
                <button
                  onClick={handleUpdateService}
                  disabled={isUpdating}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-soft transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isUpdating && <span className="animate-spin text-sm">⏳</span>}
                  <span>{isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailOpen && selectedService && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={() => setIsDetailOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className={`relative h-40 overflow-hidden ${selectedService.imageUrl ? '' : 'bg-slate-100 flex items-center justify-center'}`}>
              {selectedService.imageUrl ? (
                <img src={selectedService.imageUrl} alt={selectedService.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl">{categoryIcons[selectedService.category]}</span>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5">
                <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] inline-flex items-center gap-1 mb-2 ${categoryColors[selectedService.category].bg} ${categoryColors[selectedService.category].text}`}>
                  <span>{categoryIcons[selectedService.category]}</span>
                  <span>{categoryLabels[selectedService.category]}</span>
                </span>
                <h3 className="text-lg font-bold font-display text-white">{selectedService.name}</h3>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-600 flex items-center justify-center text-sm font-bold transition-colors shadow-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedService.description || 'Chưa có mô tả.'}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Thời lượng</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
                    {selectedService.durationMinutes >= 1440
                      ? `${Math.floor(selectedService.durationMinutes / 1440)} ngày`
                      : `${selectedService.durationMinutes} phút`}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Đơn giá</div>
                  <div className="text-sm font-bold mt-0.5 font-mono">
                    {selectedService.basePrice === 0 ? (
                      <span className="text-slate-400">Miễn phí</span>
                    ) : (
                      <span className="text-emerald-700">{formatVND(selectedService.basePrice)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button onClick={() => setIsDetailOpen(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer">
                Đóng
              </button>
              {!isSystemCategory(selectedService.category) && (
                <button
                  onClick={() => openEditModal(selectedService)}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-soft transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>✏️</span><span>Chỉnh sửa dịch vụ</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {isDeleteOpen && serviceToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={() => setIsDeleteOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-lg shrink-0">🗑️</div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Xóa dịch vụ</h3>
                <p className="text-[11px] text-slate-500">Chuyển sang trạng thái đã xóa (soft delete)</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa dịch vụ <strong className="text-slate-900">{serviceToDelete.name}</strong> (ID: <span className="font-mono">#{serviceToDelete.id}</span>)?
            </p>

            {deleteError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">{deleteError}</div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button onClick={() => setIsDeleteOpen(false)} disabled={isDeleting} className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer">
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold shadow-soft transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting && <span className="animate-spin text-xs">⏳</span>}
                <span>{isDeleting ? 'Đang xử lý...' : 'Xác nhận xóa'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
