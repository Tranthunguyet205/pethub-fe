'use client'

import React, { useState, useMemo } from 'react'
import { usePets } from '@/hooks/usePetQueries'
import type { Pet, PetGender, GetAllPetParams } from '@/types'

const genderLabels: Record<PetGender, string> = {
  MALE: 'Đực',
  FEMALE: 'Cái',
  UNKNOWN: 'Không rõ',
}

const genderConfig: Record<PetGender, { icon: string; bg: string; text: string }> = {
  MALE: { icon: '♂️', bg: 'bg-blue-100', text: 'text-blue-800' },
  FEMALE: { icon: '♀️', bg: 'bg-pink-100', text: 'text-pink-800' },
  UNKNOWN: { icon: '❓', bg: 'bg-slate-100', text: 'text-slate-600' },
}

const speciesIcons: Record<string, string> = {
  'chó': '🐕', 'dog': '🐕', 'mèo': '🐈', 'cat': '🐈',
  'hamster': '🐹', 'thỏ': '🐇', 'rabbit': '🐇', 'chim': '🐦', 'bird': '🐦',
}

const getSpeciesIcon = (species: string) =>
  speciesIcons[species.toLowerCase()] || '🐾'

const formatAge = (birthDate: string | null) => {
  if (!birthDate) return null
  const now = new Date()
  const birth = new Date(birthDate)
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth()
  if (months < 1) return 'Sơ sinh'
  if (months < 12) return `${months} tháng`
  const years = Math.floor(months / 12)
  const remainMonths = months % 12
  return remainMonths > 0 ? `${years} tuổi ${remainMonths} tháng` : `${years} tuổi`
}

export default function AdminPetsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterGender, setFilterGender] = useState<PetGender | ''>('')
  const [filterSpecies, setFilterSpecies] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  const queryParams = useMemo<GetAllPetParams>(() => ({
    page,
    limit,
    search: searchQuery.trim() || undefined,
    gender: filterGender || undefined,
    species: filterSpecies || undefined,
  }), [page, searchQuery, filterGender, filterSpecies])

  const { data: response, isLoading } = usePets(queryParams)

  const allPets = useMemo(() => response?.data ?? [], [response])
  const pagination = response?.meta
  const totalPages = pagination?.totalPages ?? 1

  const stats = useMemo(() => {
    const all = allPets
    return {
      total: pagination?.total ?? all.length,
      dogs: all.filter(p => p.species.toLowerCase().includes('chó') || p.species.toLowerCase().includes('dog')).length,
      cats: all.filter(p => p.species.toLowerCase().includes('mèo') || p.species.toLowerCase().includes('cat')).length,
      withAllergy: all.filter(p => p.allergyNotes).length,
    }
  }, [allPets, pagination])

  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const openDetail = (p: Pet) => {
    setSelectedPet(p)
    setIsDetailOpen(true)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900">Thú cưng trong hệ thống</h1>
        <p className="text-xs text-slate-500">Tra cứu thông tin thú cưng đã đăng ký. Hồ sơ do chủ nuôi (Owner) quản lý.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng số</div>
          <div className="text-2xl font-extrabold font-display text-slate-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">🐕 Chó</div>
          <div className="text-2xl font-extrabold font-display text-amber-700 mt-1">{stats.dogs}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">🐈 Mèo</div>
          <div className="text-2xl font-extrabold font-display text-indigo-700 mt-1">{stats.cats}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">⚠️ Có dị ứng</div>
          <div className="text-2xl font-extrabold font-display text-rose-600 mt-1">{stats.withAllergy}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <input
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
          type="text"
          placeholder="Tìm tên, giống, chủ nuôi..."
          className="flex-1 min-w-[200px] px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-brand-500"
        />
        <select
          value={filterGender}
          onChange={(e) => { setFilterGender(e.target.value as PetGender | ''); setPage(1) }}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs"
        >
          <option value="">Tất cả giới tính</option>
          <option value="MALE">Đực</option>
          <option value="FEMALE">Cái</option>
          <option value="UNKNOWN">Không rõ</option>
        </select>
        <select
          value={filterSpecies}
          onChange={(e) => { setFilterSpecies(e.target.value); setPage(1) }}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs"
        >
          <option value="">Tất cả loài</option>
          <option value="Chó">Chó</option>
          <option value="Mèo">Mèo</option>
          <option value="Hamster">Hamster</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Đang tải dữ liệu...</div>
        ) : allPets.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">Không tìm thấy thú cưng nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Thú cưng</th>
                  <th className="py-3 px-4">Loài / Giống</th>
                  <th className="py-3 px-4">Giới tính</th>
                  <th className="py-3 px-4">Tuổi</th>
                  <th className="py-3 px-4">Cân nặng</th>
                  <th className="py-3 px-4">Chủ nuôi</th>
                  <th className="py-3 px-4">Dị ứng</th>
                  <th className="py-3 px-4 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allPets.map((pet) => (
                  <tr
                    key={pet.id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => openDetail(pet)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {pet.avatarUrl ? (
                          <img src={pet.avatarUrl} alt={pet.name} className="w-9 h-9 rounded-xl object-cover border border-slate-200" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
                            {getSpeciesIcon(pet.species)}
                          </div>
                        )}
                        <span className="font-bold text-slate-900">{pet.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span>{getSpeciesIcon(pet.species)} {pet.species}</span>
                      {pet.breed && <span className="text-slate-400 ml-1">· {pet.breed}</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${genderConfig[pet.gender].bg} ${genderConfig[pet.gender].text}`}>
                        {genderConfig[pet.gender].icon} {genderLabels[pet.gender]}
                      </span>
                    </td>
                    <td className="py-3 px-4">{formatAge(pet.birthDate) || '—'}</td>
                    <td className="py-3 px-4 font-mono font-bold">{pet.weight} kg</td>
                    <td className="py-3 px-4">
                      {pet.user ? (
                        <div>
                          <div className="font-medium text-slate-800">{pet.user.fullName}</div>
                          <div className="text-[10px] text-slate-400">{pet.user.phoneNumber || pet.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {pet.allergyNotes ? (
                        <span className="text-rose-600 font-bold">⚠️ Có</span>
                      ) : (
                        <span className="text-slate-300">Không</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); openDetail(pet) }}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 border border-slate-200 cursor-pointer"
                      >
                        Xem
                      </button>
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
            <span className="text-slate-400">Trang {page} / {totalPages} · Tổng {pagination?.total} thú cưng</span>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg font-bold transition-colors cursor-pointer ${
                    p === page ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailOpen && selectedPet && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsDetailOpen(false)}
        >
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header with avatar */}
            <div className="relative h-32 bg-gradient-to-r from-indigo-900 to-slate-800 flex items-end px-6 pb-4">
              {selectedPet.avatarUrl ? (
                <img
                  src={selectedPet.avatarUrl}
                  alt={selectedPet.name}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg -mb-6"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl border-4 border-white shadow-lg -mb-6">
                  {getSpeciesIcon(selectedPet.species)}
                </div>
              )}
              <div className="ml-4 mb-1">
                <h2 className="text-xl font-bold text-white">{selectedPet.name}</h2>
                <p className="text-xs text-slate-300">{selectedPet.species} · {selectedPet.breed || 'Không rõ giống'}</p>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="absolute top-3 right-3 text-white/70 hover:text-white text-lg font-bold cursor-pointer">✕</button>
            </div>

            <div className="p-6 pt-8 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-0.5">Giới tính</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${genderConfig[selectedPet.gender].bg} ${genderConfig[selectedPet.gender].text}`}>
                    {genderConfig[selectedPet.gender].icon} {genderLabels[selectedPet.gender]}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-0.5">Cân nặng</span>
                  <span className="font-bold text-slate-900">{selectedPet.weight} kg</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-0.5">Tuổi</span>
                  <span className="font-bold text-slate-900">{formatAge(selectedPet.birthDate) || 'Chưa rõ'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-0.5">Ngày sinh</span>
                  <span className="font-bold text-slate-900">{selectedPet.birthDate?.split('T')[0] || 'Chưa rõ'}</span>
                </div>
              </div>

              {/* Owner */}
              {selectedPet.user && (
                <div className="bg-slate-50 rounded-xl p-3 text-xs border border-slate-200">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">Chủ nuôi</span>
                  <div className="font-bold text-slate-900">{selectedPet.user.fullName}</div>
                  <div className="text-slate-500">{selectedPet.user.email} · {selectedPet.user.phoneNumber || 'Chưa có SĐT'}</div>
                </div>
              )}

              {/* Allergy */}
              {selectedPet.allergyNotes && (
                <div className="bg-rose-50 rounded-xl p-3 text-xs border border-rose-200">
                  <span className="font-bold text-rose-700">⚠️ Dị ứng:</span>
                  <p className="text-rose-800 mt-0.5">{selectedPet.allergyNotes}</p>
                </div>
              )}

              {/* Special Notes */}
              {selectedPet.specialNotes && (
                <div className="bg-amber-50 rounded-xl p-3 text-xs border border-amber-200">
                  <span className="font-bold text-amber-700">📝 Lưu ý đặc biệt:</span>
                  <p className="text-amber-800 mt-0.5">{selectedPet.specialNotes}</p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button onClick={() => setIsDetailOpen(false)} className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
