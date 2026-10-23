'use client'

import React, { useMemo, useState } from 'react'
import type { CreateUserDto, User, UserQueryParams, UserRole } from '@/types'
import { useUsers } from '@/hooks/useUserQueries'
import { UserDetailModal } from '@/components/admin/UserDetailModal'
import { UserEditModal } from '@/components/admin/UserEditModal'
import { UserCreateModal } from '@/components/admin/UserCreateModal'
import { UserDeleteModal } from '@/components/admin/UserDeleteModal'

export default function AdminUsersPage() {
  // 1. Phân trang & Tìm kiếm & Bộ lọc
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'ALL' | UserRole>('ALL')
  const [toastMessage, setToastMessage] = useState('')

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 4000)
  }

  // Query Params
  const queryParams = useMemo<UserQueryParams>(() => {
    return {
      page,
      limit,
      role: selectedRoleFilter === 'ALL' ? undefined : selectedRoleFilter,
      search: searchQuery.trim() || undefined,
    }
  }, [page, limit, selectedRoleFilter, searchQuery])

  // Call API GET /users
  const { data: response, isLoading: isLoadingUsers } = useUsers(queryParams)

  const userList = useMemo(() => response?.data ?? [], [response])
  const metaPage = response?.meta

  // Dữ liệu phân trang
  const totalItems = metaPage?.total ?? userList.length
  const totalPages = metaPage?.totalPages ?? Math.max(1, Math.ceil(totalItems / limit))
  const currentPage = metaPage?.page ?? page

  // Reset về page 1 khi filter hoặc search thay đổi
  const handleRoleFilterChange = (role: 'ALL' | UserRole) => {
    setSelectedRoleFilter(role)
    setPage(1)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setPage(1)
  }

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(e.target.value))
    setPage(1)
  }

  const goToPage = (p: number) => {
    if (p >= 1 && p <= totalPages) {
      setPage(p)
    }
  }

  // Danh sách các số trang hiển thị
  const visiblePages = useMemo(() => {
    const total = totalPages
    const current = currentPage
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1)
    }
    const pages: number[] = []
    pages.push(1)
    if (current > 3) pages.push(-1)
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i)
    }
    if (current < total - 2) pages.push(-1)
    if (total > 1) pages.push(total)
    return pages
  }, [totalPages, currentPage])

  // Quick stats
  const stats = useMemo(() => {
    return {
      total: totalItems,
      owners: userList.filter((u) => u.role === 'OWNER').length,
      staffs: userList.filter((u) => u.role === 'STAFF').length,
      admins: userList.filter((u) => u.role === 'ADMIN').length,
    }
  }, [totalItems, userList])

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const handleOpenDetail = (u: User) => {
    setSelectedUser(u)
    setIsDetailOpen(true)
  }

  const handleOpenEdit = (u: User) => {
    setSelectedUser(u)
    setIsEditOpen(true)
  }

  const handleOpenDelete = (u: User) => {
    setSelectedUser(u)
    setIsDeleteOpen(true)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="text-base">🎉</span>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage('')}
            className="ml-2 text-slate-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
            Người dùng & Phân quyền (RBAC)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Admin tạo tài khoản và phân quyền trực tiếp cho Chủ nuôi (Owner) và Kỹ thuật viên (Staff).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-soft transition-all flex items-center gap-2 cursor-pointer w-max"
        >
          <span>➕</span>
          <span>Thêm người dùng</span>
        </button>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => handleRoleFilterChange('ALL')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedRoleFilter === 'ALL'
              ? 'bg-purple-50/50 border-purple-300 ring-2 ring-purple-400/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Tổng người dùng
          </div>
          <div className="text-2xl font-extrabold font-display text-slate-900 mt-1">
            {stats.total}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Bao gồm tất cả vai trò</div>
        </div>

        <div
          onClick={() => handleRoleFilterChange('OWNER')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedRoleFilter === 'OWNER'
              ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-400/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <span>🐶</span> Chủ nuôi (Owner)
          </div>
          <div className="text-2xl font-extrabold font-display text-emerald-700 mt-1">
            {stats.owners}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Khách hàng sử dụng dịch vụ</div>
        </div>

        <div
          onClick={() => handleRoleFilterChange('STAFF')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedRoleFilter === 'STAFF'
              ? 'bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-400/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
            <span>✂️</span> Kỹ thuật viên (Staff)
          </div>
          <div className="text-2xl font-extrabold font-display text-indigo-700 mt-1">
            {stats.staffs}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Bác sĩ & Nhân viên spa</div>
        </div>

        <div
          onClick={() => handleRoleFilterChange('ADMIN')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedRoleFilter === 'ADMIN'
              ? 'bg-purple-50/50 border-purple-300 ring-2 ring-purple-400/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1">
            <span>⚙️</span> Quản trị (Admin)
          </div>
          <div className="text-2xl font-extrabold font-display text-purple-700 mt-1">
            {stats.admins}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Quyền kiểm soát hệ thống</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
        {/* Search & Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Tìm theo tên, email, SĐT..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs w-full sm:w-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => handleRoleFilterChange('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedRoleFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => handleRoleFilterChange('OWNER')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedRoleFilter === 'OWNER'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chủ nuôi ({stats.owners})
            </button>
            <button
              type="button"
              onClick={() => handleRoleFilterChange('STAFF')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedRoleFilter === 'STAFF'
                  ? 'bg-white text-indigo-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nhân viên ({stats.staffs})
            </button>
            <button
              type="button"
              onClick={() => handleRoleFilterChange('ADMIN')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedRoleFilter === 'ADMIN'
                  ? 'bg-white text-purple-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin ({stats.admins})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Người dùng</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Số điện thoại</th>
                <th className="py-3 px-4">Vai trò (Role)</th>
                <th className="py-3 px-4">Chi tiết nghiệp vụ</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {userList.length > 0 &&
                userList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {u.avatarUrl ? (
                          <img
                            src={u.avatarUrl}
                            alt={u.fullName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-xs shrink-0"
                          />
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs shrink-0 ${
                              u.role === 'ADMIN'
                                ? 'bg-purple-600'
                                : u.role === 'STAFF'
                                ? 'bg-indigo-600'
                                : 'bg-emerald-600'
                            }`}
                          >
                            {u.fullName?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900">{u.fullName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: #{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium">{u.email}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{u.phoneNumber || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] inline-flex items-center gap-1 ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'STAFF'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        <span>{u.role === 'ADMIN' ? '⚙️' : u.role === 'STAFF' ? '✂️' : '🐶'}</span>
                        <span>{u.role}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.role === 'OWNER' ? (
                        <span className="text-slate-600 font-medium">
                          🐾 {u.petCount ?? 0} bé thú cưng
                        </span>
                      ) : u.role === 'STAFF' ? (
                        <span className="text-indigo-700 font-medium">
                          🩺 {u.specialty || 'Nhân viên kỹ thuật'}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Quản trị viên hệ thống</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {!u.isDelete ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-600">
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          Đã vô hiệu
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(u)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 hover:text-purple-700 text-slate-700 font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>👁️</span>
                          <span>Chi tiết</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                          title="Chỉnh sửa thông tin"
                        >
                          <span>✏️</span>
                          <span>Sửa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(u)}
                          disabled={u.role === 'ADMIN'}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                            u.role === 'ADMIN'
                              ? 'opacity-30 cursor-not-allowed text-slate-400'
                              : u.isDelete
                              ? 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                          title={
                            u.role === 'ADMIN'
                              ? 'Không thể vô hiệu hóa Admin'
                              : u.isDelete
                              ? 'Tài khoản đã vô hiệu hóa'
                              : 'Xóa mềm / Vô hiệu hóa người dùng (DELETE /api/users/{id})'
                          }
                        >
                          <span>🗑️</span>
                          <span>{u.isDelete ? 'Đã khóa' : 'Xóa'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {/* Loading Indicator */}
              {isLoadingUsers && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2.5 text-slate-600 font-semibold text-xs">
                      <span className="animate-spin text-base">⏳</span>
                      <span>Đang tải danh sách người dùng...</span>
                    </div>
                  </td>
                </tr>
              )}

              {/* Empty state */}
              {!isLoadingUsers && userList.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="text-3xl mb-2">🔍</div>
                    <div className="font-bold text-slate-600 text-sm">
                      Không tìm thấy người dùng phù hợp
                    </div>
                    <div className="text-xs mt-1">Thử thay đổi từ khóa hoặc bộ lọc vai trò</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span>
              Hiển thị{' '}
              <strong className="text-slate-900">
                {totalItems > 0 ? (currentPage - 1) * limit + 1 : 0}
              </strong>{' '}
              -{' '}
              <strong className="text-slate-900">
                {Math.min(currentPage * limit, totalItems)}
              </strong>{' '}
              trên tổng số <strong className="text-slate-900">{totalItems}</strong> người dùng
            </span>

            <span className="text-slate-300">|</span>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Mỗi trang:</span>
              <select
                value={limit}
                onChange={handleLimitChange}
                className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1 || isLoadingUsers}
              onClick={() => goToPage(currentPage - 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>‹</span>
              <span>Trước</span>
            </button>

            {visiblePages.map((p, idx) =>
              p === -1 ? (
                <span key={idx} className="px-2 py-1 text-slate-400">
                  ...
                </span>
              ) : (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToPage(p)}
                  disabled={isLoadingUsers}
                  className={`w-8 h-8 rounded-lg font-bold text-xs transition-all flex items-center justify-center cursor-pointer ${
                    p === currentPage
                      ? 'bg-purple-600 text-white shadow-soft'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              type="button"
              disabled={currentPage >= totalPages || isLoadingUsers}
              onClick={() => goToPage(currentPage + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Sau</span>
              <span>›</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UserCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(newUser) => {
          showToast(`Đã tạo tài khoản thành công cho ${newUser.fullName} (${newUser.role})!`)
        }}
      />

      <UserDetailModal
        isOpen={isDetailOpen}
        user={selectedUser}
        onClose={() => setIsDetailOpen(false)}
        onEdit={(u) => {
          setSelectedUser(u)
          setIsEditOpen(true)
        }}
        onDelete={(u) => {
          setSelectedUser(u)
          setIsDeleteOpen(true)
        }}
      />

      <UserEditModal
        isOpen={isEditOpen}
        user={selectedUser}
        onClose={() => setIsEditOpen(false)}
        onSuccess={(updated) => {
          showToast(`Đã cập nhật thông tin cho ${updated.fullName || 'người dùng'} thành công!`)
        }}
        onDelete={(u) => {
          setSelectedUser(u)
          setIsDeleteOpen(true)
        }}
      />

      <UserDeleteModal
        isOpen={isDeleteOpen}
        user={selectedUser}
        onClose={() => setIsDeleteOpen(false)}
        onSuccess={(deleted) => {
          showToast(`Đã vô hiệu hóa tài khoản ${deleted.fullName} thành công!`)
        }}
      />
    </div>
  )
}
