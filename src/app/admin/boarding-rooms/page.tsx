'use client'

import React, { useState, useMemo, useRef } from 'react'
import {
  useBoardingRooms,
  useCreateBoardingRoom,
  useUpdateBoardingRoom,
  useDeleteBoardingRoom,
} from '@/hooks/useBoardingRoomQueries'
import { useFormatters } from '@/hooks/useFormatters'
import type { BoardingRoom, RoomStatus, GetAllBoardingRoomParams } from '@/types'

const statusConfig: Record<RoomStatus, { label: string; icon: string; bg: string; text: string; dot: string }> = {
  AVAILABLE: { label: 'Trống', icon: '✅', bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  OCCUPIED: { label: 'Đang sử dụng', icon: '🐾', bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
  MAINTENANCE: { label: 'Bảo trì', icon: '🔧', bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500' },
}

const statusOptions: { value: RoomStatus; label: string }[] = [
  { value: 'AVAILABLE', label: 'Trống (Available)' },
  { value: 'OCCUPIED', label: 'Đang sử dụng (Occupied)' },
  { value: 'MAINTENANCE', label: 'Bảo trì (Maintenance)' },
]

export default function AdminBoardingRoomsPage() {
  const { formatVND } = useFormatters()

  const { mutateAsync: createRoom, isPending: isCreating } = useCreateBoardingRoom()
  const { mutateAsync: updateRoom, isPending: isUpdating } = useUpdateBoardingRoom()
  const { mutateAsync: deleteRoom, isPending: isDeleting } = useDeleteBoardingRoom()

  // ── Filters ────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<RoomStatus | ''>('')
  const [page, setPage] = useState(1)
  const limit = 20

  const queryParams = useMemo<GetAllBoardingRoomParams>(() => ({
    page,
    limit,
    search: searchQuery.trim() || undefined,
    status: filterStatus || undefined,
  }), [page, searchQuery, filterStatus])

  const { data: response, isLoading } = useBoardingRooms(queryParams)

  const allRooms = useMemo(() => response?.data ?? [], [response])
  const pagination = response?.meta
  const totalPages = pagination?.totalPages ?? 1

  // ── Stats ──────────────────────────────────────────
  const stats = useMemo(() => ({
    total: pagination?.total ?? allRooms.length,
    available: allRooms.filter((r) => r.status === 'AVAILABLE').length,
    occupied: allRooms.filter((r) => r.status === 'OCCUPIED').length,
    maintenance: allRooms.filter((r) => r.status === 'MAINTENANCE').length,
  }), [allRooms, pagination])

  // ── Toast ──────────────────────────────────────────
  const [toastMessage, setToastMessage] = useState('')
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 4000)
  }

  // ── Detail Modal ───────────────────────────────────
  const [selectedRoom, setSelectedRoom] = useState<BoardingRoom | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const openDetail = (r: BoardingRoom) => {
    setSelectedRoom(r)
    setIsDetailOpen(true)
  }

  // ── Create Modal ───────────────────────────────────
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createForm, setCreateForm] = useState({ name: '', description: '', pricePerNight: 0, status: 'AVAILABLE' as RoomStatus })
  const [createImageFile, setCreateImageFile] = useState<File | null>(null)
  const [createImagePreview, setCreateImagePreview] = useState<string | null>(null)
  const createImageRef = useRef<HTMLInputElement>(null)

  const onCreateImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCreateImageFile(file)
    setCreateImagePreview(URL.createObjectURL(file))
  }

  const resetCreateForm = () => {
    setCreateForm({ name: '', description: '', pricePerNight: 0, status: 'AVAILABLE' })
    setCreateImageFile(null)
    setCreateImagePreview(null)
    setCreateError('')
    if (createImageRef.current) createImageRef.current.value = ''
  }

  const openCreateModal = () => {
    resetCreateForm()
    setIsCreateOpen(true)
  }

  const handleCreate = async () => {
    if (!createForm.name.trim() || !createForm.description.trim()) {
      setCreateError('Vui lòng điền đầy đủ Tên phòng và Mô tả.')
      return
    }
    if (createForm.pricePerNight < 0) {
      setCreateError('Đơn giá không được âm.')
      return
    }
    setCreateError('')
    try {
      await createRoom({
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        pricePerNight: createForm.pricePerNight,
        status: createForm.status,
        image: createImageFile || undefined,
      })
      showToast(`Đã tạo phòng "${createForm.name}" thành công!`)
      setIsCreateOpen(false)
    } catch (err: any) {
      setCreateError(err?.data?.message || err?.message || 'Có lỗi xảy ra!')
    }
  }

  // ── Edit Modal ─────────────────────────────────────
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editError, setEditError] = useState('')
  const [roomToEdit, setRoomToEdit] = useState<BoardingRoom | null>(null)
  const [editForm, setEditForm] = useState({ name: '', description: '', pricePerNight: 0, status: 'AVAILABLE' as RoomStatus })
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const editImageRef = useRef<HTMLInputElement>(null)

  const onEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setEditImageFile(file)
    setEditImagePreview(URL.createObjectURL(file))
  }

  const openEditModal = (r: BoardingRoom) => {
    setRoomToEdit(r)
    setEditForm({ name: r.name, description: r.description, pricePerNight: r.pricePerNight, status: r.status })
    setEditImageFile(null)
    setEditImagePreview(null)
    setEditError('')
    setIsDetailOpen(false)
    setIsEditOpen(true)
  }

  const handleUpdate = async () => {
    if (!roomToEdit) return
    if (!editForm.name.trim()) {
      setEditError('Tên phòng không được để trống.')
      return
    }
    setEditError('')

    const original = roomToEdit
    const changes: Record<string, any> = {}
    if (editForm.name.trim() !== original.name) changes.name = editForm.name.trim()
    if (editForm.description.trim() !== original.description) changes.description = editForm.description.trim()
    if (editForm.pricePerNight !== original.pricePerNight) changes.pricePerNight = editForm.pricePerNight
    if (editForm.status !== original.status) changes.status = editForm.status
    if (editImageFile) changes.image = editImageFile

    if (Object.keys(changes).length === 0) {
      setIsEditOpen(false)
      return
    }

    try {
      await updateRoom({ id: original.id, data: changes })
      showToast(`Đã cập nhật phòng "${editForm.name}" thành công!`)
      setIsEditOpen(false)
    } catch (err: any) {
      setEditError(err?.data?.message || err?.message || 'Có lỗi xảy ra!')
    }
  }

  // ── Delete Modal ───────────────────────────────────
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState<BoardingRoom | null>(null)

  const openDeleteModal = (r: BoardingRoom) => {
    setRoomToDelete(r)
    setIsDeleteOpen(true)
    setIsDetailOpen(false)
  }

  const handleDelete = async () => {
    if (!roomToDelete) return
    try {
      await deleteRoom(roomToDelete.id)
      showToast(`Đã xóa phòng "${roomToDelete.name}"`)
      setIsDeleteOpen(false)
    } catch (err: any) {
      showToast(`Lỗi: ${err?.data?.message || err?.message || 'Không thể xóa'}`)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[100] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold transition-opacity">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Quản lý Phòng lưu trú (Boarding Rooms)</h1>
          <p className="text-xs text-slate-500">Tạo, chỉnh sửa, đổi trạng thái và xóa phòng/chuồng lưu trú cho dịch vụ Boarding.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-soft transition-all cursor-pointer"
        >
          + Thêm phòng mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng phòng</div>
          <div className="text-2xl font-extrabold font-display text-slate-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">✅ Trống</div>
          <div className="text-2xl font-extrabold font-display text-emerald-600 mt-1">{stats.available}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">🐾 Đang dùng</div>
          <div className="text-2xl font-extrabold font-display text-amber-600 mt-1">{stats.occupied}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">🔧 Bảo trì</div>
          <div className="text-2xl font-extrabold font-display text-slate-600 mt-1">{stats.maintenance}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <input
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
          type="text"
          placeholder="Tìm tên phòng, mô tả..."
          className="flex-1 min-w-[200px] px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-brand-500"
        />
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value as RoomStatus | ''); setPage(1) }}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs"
        >
          <option value="">Tất cả trạng thái</option>
          {statusOptions.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Đang tải dữ liệu...</div>
        ) : allRooms.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">Không tìm thấy phòng lưu trú nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Hình ảnh</th>
                  <th className="py-3 px-4">Tên phòng</th>
                  <th className="py-3 px-4">Mô tả</th>
                  <th className="py-3 px-4">Đơn giá / đêm</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allRooms.map((room) => (
                  <tr
                    key={room.id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => openDetail(room)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">#{room.id}</td>
                    <td className="py-3.5 px-4">
                      {room.imageUrl ? (
                        <img src={room.imageUrl} alt={room.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-lg">🏠</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{room.name}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-[300px] truncate text-slate-500">{room.description}</td>
                    <td className="py-3.5 px-4 font-bold text-brand-700">{formatVND(room.pricePerNight)}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${statusConfig[room.status].bg} ${statusConfig[room.status].text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[room.status].dot}`} />
                        {statusConfig[room.status].icon} {statusConfig[room.status].label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(room)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-[10px] hover:bg-blue-100 border border-blue-200 cursor-pointer"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => openDeleteModal(room)}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold text-[10px] hover:bg-rose-100 border border-rose-200 cursor-pointer"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 text-xs">
            <span className="text-slate-400">Trang {page} / {totalPages} · Tổng {pagination?.total} phòng</span>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg font-bold transition-colors cursor-pointer ${p === page ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════ Detail Modal ═══════════════ */}
      {isDetailOpen && selectedRoom && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsDetailOpen(false)}
        >
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-sky-900 to-slate-800 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">{selectedRoom.name}</h2>
                <p className="text-xs text-slate-300 mt-0.5">ID: #{selectedRoom.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusConfig[selectedRoom.status].bg} ${statusConfig[selectedRoom.status].text}`}>
                  {statusConfig[selectedRoom.status].icon} {statusConfig[selectedRoom.status].label}
                </span>
                <button onClick={() => setIsDetailOpen(false)} className="text-white/70 hover:text-white text-lg font-bold ml-2 cursor-pointer">✕</button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {selectedRoom.imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-200">
                  <img src={selectedRoom.imageUrl} alt={selectedRoom.name} className="w-full h-48 object-cover" />
                </div>
              )}

              <div className="text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-1">Mô tả</span>
                <p className="text-slate-700 leading-relaxed">{selectedRoom.description}</p>
              </div>

              <div className="bg-brand-50 rounded-xl p-4 border border-brand-200 text-center">
                <span className="text-xs text-brand-500 font-semibold uppercase tracking-wider block">Đơn giá theo đêm</span>
                <div className="text-2xl font-extrabold font-display text-brand-700 mt-1">{formatVND(selectedRoom.pricePerNight)}</div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(selectedRoom)}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 cursor-pointer"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => openDeleteModal(selectedRoom)}
                    className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs hover:bg-rose-100 border border-rose-200 cursor-pointer"
                  >
                    Xóa
                  </button>
                </div>
                <button onClick={() => setIsDetailOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ Create Modal ═══════════════ */}
      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsCreateOpen(false)}
        >
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-brand-700 to-brand-900 px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Thêm phòng lưu trú mới</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-white/70 hover:text-white text-lg font-bold cursor-pointer">✕</button>
            </div>

            <div className="p-6 space-y-4">
              {createError && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 font-medium">
                  {createError}
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tên phòng *</label>
                  <input
                    value={createForm.name}
                    onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                    type="text"
                    placeholder="VD: Phòng VIP 01, Chuồng Standard 02..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-brand-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mô tả *</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    placeholder="Tiện ích, trang thiết bị..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-brand-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Đơn giá / đêm (VNĐ) *</label>
                  <input
                    value={createForm.pricePerNight}
                    onChange={(e) => setCreateForm((f) => ({ ...f, pricePerNight: Number(e.target.value) }))}
                    type="number"
                    min={0}
                    step={1000}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-brand-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Trạng thái ban đầu</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm((f) => ({ ...f, status: e.target.value as RoomStatus }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  >
                    {statusOptions.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hình ảnh phòng</label>
                  <input
                    ref={createImageRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={onCreateImageChange}
                    className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-brand-50 file:text-brand-700 file:font-bold file:text-[10px] hover:file:bg-brand-100"
                  />
                  {createImagePreview && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-slate-200">
                      <img src={createImagePreview} className="w-full h-32 object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer">
                  Hủy
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 shadow-soft disabled:opacity-50 cursor-pointer"
                >
                  {isCreating ? 'Đang tạo...' : 'Tạo phòng'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ Edit Modal ═══════════════ */}
      {isEditOpen && roomToEdit && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsEditOpen(false)}
        >
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Chỉnh sửa: {roomToEdit.name}</h2>
              <button onClick={() => setIsEditOpen(false)} className="text-white/70 hover:text-white text-lg font-bold cursor-pointer">✕</button>
            </div>

            <div className="p-6 space-y-4">
              {editError && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 font-medium">
                  {editError}
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tên phòng *</label>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    type="text"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-brand-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mô tả</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-brand-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Đơn giá / đêm (VNĐ)</label>
                  <input
                    value={editForm.pricePerNight}
                    onChange={(e) => setEditForm((f) => ({ ...f, pricePerNight: Number(e.target.value) }))}
                    type="number"
                    min={0}
                    step={1000}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-brand-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Trạng thái</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as RoomStatus }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  >
                    {statusOptions.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hình ảnh phòng</label>
                  {roomToEdit.imageUrl && !editImagePreview && (
                    <div className="mb-2 rounded-xl overflow-hidden border border-slate-200">
                      <img src={roomToEdit.imageUrl} className="w-full h-32 object-cover" />
                    </div>
                  )}
                  {editImagePreview && (
                    <div className="mb-2 rounded-xl overflow-hidden border border-blue-300">
                      <img src={editImagePreview} className="w-full h-32 object-cover" />
                      <div className="bg-blue-50 text-blue-700 text-[10px] font-bold text-center py-1">Ảnh mới</div>
                    </div>
                  )}
                  <input
                    ref={editImageRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={onEditImageChange}
                    className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-bold file:text-[10px] hover:file:bg-blue-100"
                  />
                </div>
              </div>

              {/* Change comparison */}
              <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1 border border-slate-200">
                <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">Thay đổi:</span>
                {editForm.name.trim() !== roomToEdit.name && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tên:</span>
                    <span><span className="line-through text-slate-400">{roomToEdit.name}</span> → <span className="font-bold text-blue-700">{editForm.name}</span></span>
                  </div>
                )}
                {editForm.pricePerNight !== roomToEdit.pricePerNight && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Giá / đêm:</span>
                    <span><span className="line-through text-slate-400">{formatVND(roomToEdit.pricePerNight)}</span> → <span className="font-bold text-blue-700">{formatVND(editForm.pricePerNight)}</span></span>
                  </div>
                )}
                {editForm.status !== roomToEdit.status && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Trạng thái:</span>
                    <span><span className="line-through text-slate-400">{statusConfig[roomToEdit.status].label}</span> → <span className="font-bold text-blue-700">{statusConfig[editForm.status].label}</span></span>
                  </div>
                )}
                {editForm.name.trim() === roomToEdit.name &&
                  editForm.pricePerNight === roomToEdit.pricePerNight &&
                  editForm.status === roomToEdit.status &&
                  editForm.description.trim() === roomToEdit.description &&
                  !editImageFile && (
                  <div className="text-slate-400 italic">Chưa có thay đổi nào.</div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button onClick={() => setIsEditOpen(false)} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer">
                  Hủy
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-soft disabled:opacity-50 cursor-pointer"
                >
                  {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ Delete Confirm Modal ═══════════════ */}
      {isDeleteOpen && roomToDelete && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsDeleteOpen(false)}
        >
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl">🗑️</div>
              <h3 className="font-bold text-slate-900 mt-3">Xóa phòng lưu trú?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Phòng &quot;<strong>{roomToDelete.name}</strong>&quot; sẽ bị xóa. Nếu phòng đang có booking hoạt động, thao tác sẽ bị từ chối.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsDeleteOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer">
                Hủy bỏ
              </button>
              <button onClick={handleDelete} disabled={isDeleting} className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer disabled:opacity-50">
                {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
