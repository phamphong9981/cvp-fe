'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
    useGetAdminTickets,
    useCreateAdminTicket,
    useUpdateAdminTicket,
    useDeleteAdminTicket,
    DINNER_TICKET_STATUS,
    DINNER_TICKETS_TYPE,
    type FilterOptions,
    type StudentStatistics,
    type DinnerTicket,
} from '@/hooks/useDinnerTickets'
import { useGetClasses } from '@/hooks/useClasses'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function DinnerTicketsPage() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()

    // State
    const [activeTab, setActiveTab] = useState<'tickets' | 'statistics'>('tickets')
    const [filters, setFilters] = useState<FilterOptions>({})
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [selectedProfileId, setSelectedProfileId] = useState<string>('')
    const [selectedStatus, setSelectedStatus] = useState<DINNER_TICKET_STATUS>(DINNER_TICKET_STATUS.ACTIVE)
    const [selectedType, setSelectedType] = useState<DINNER_TICKETS_TYPE>(DINNER_TICKETS_TYPE.LUNCH)

    // Queries & Mutations
    const { data: tickets = [], isLoading: ticketsLoading } = useGetAdminTickets(filters)
    const { data: classes = [] } = useGetClasses()
    const createMutation = useCreateAdminTicket()
    const updateMutation = useUpdateAdminTicket()
    const deleteMutation = useDeleteAdminTicket()

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login')
        }
    }, [authLoading, isAuthenticated, router])

    // Calculate statistics from tickets
    const statistics = useMemo(() => {
        const statsMap = new Map<string, StudentStatistics>()

        tickets.forEach(ticket => {
            if (!ticket.profile) return

            const profileId = ticket.profileId
            const existingStat = statsMap.get(profileId)

            if (!existingStat) {
                statsMap.set(profileId, {
                    profileId: profileId,
                    studentId: ticket.profile.id || profileId, // Use profile.id as studentId
                    fullname: ticket.profile.fullname || '',
                    phone: ticket.profile.phone || '',
                    className: ticket.profile.classEntity?.name || '',
                    lunchCount: ticket.status === DINNER_TICKET_STATUS.ACTIVE && ticket.type === DINNER_TICKETS_TYPE.LUNCH ? 1 : 0,
                    dinnerCount: ticket.status === DINNER_TICKET_STATUS.ACTIVE && ticket.type === DINNER_TICKETS_TYPE.DINNER ? 1 : 0,
                    totalCount: ticket.status === DINNER_TICKET_STATUS.ACTIVE ? 1 : 0,
                    cancelledCount: ticket.status === DINNER_TICKET_STATUS.CANCELLED ? 1 : 0,
                    totalAmount: ticket.status === DINNER_TICKET_STATUS.ACTIVE && ticket.price ? ticket.price : 0,
                })
            } else {
                // Update existing stat
                if (ticket.status === DINNER_TICKET_STATUS.ACTIVE) {
                    if (ticket.type === DINNER_TICKETS_TYPE.LUNCH) {
                        existingStat.lunchCount += 1
                    } else if (ticket.type === DINNER_TICKETS_TYPE.DINNER) {
                        existingStat.dinnerCount += 1
                    }
                    existingStat.totalCount += 1
                    if (ticket.price) {
                        existingStat.totalAmount += ticket.price
                    }
                } else if (ticket.status === DINNER_TICKET_STATUS.CANCELLED) {
                    existingStat.cancelledCount += 1
                }
            }
        })

        // Convert map to array and sort by class name first, then by fullname
        return Array.from(statsMap.values()).sort((a, b) => {
            if (a.className !== b.className) {
                return a.className.localeCompare(b.className)
            }
            return a.fullname.localeCompare(b.fullname)
        })
    }, [tickets])

    // Statistics
    const stats = {
        total: tickets.length,
        active: tickets.filter(t => t.status === DINNER_TICKET_STATUS.ACTIVE).length,
        cancelled: tickets.filter(t => t.status === DINNER_TICKET_STATUS.CANCELLED).length,
        today: tickets.filter(t => t.date === new Date().toISOString().split('T')[0]).length,
        lunch: tickets.filter(t => t.type === DINNER_TICKETS_TYPE.LUNCH).length,
        dinner: tickets.filter(t => t.type === DINNER_TICKETS_TYPE.DINNER).length,
    }

    // Handlers
    const handleCreateTicket = async () => {
        try {
            await createMutation.mutateAsync({
                date: selectedDate,
                profileId: selectedProfileId,
                status: selectedStatus,
                type: selectedType,
            })
            setShowCreateModal(false)
            resetForm()
        } catch (error) {
            console.error('Create ticket error:', error)
        }
    }

    const handleUpdateTicket = async (id: string, status: DINNER_TICKET_STATUS) => {
        try {
            await updateMutation.mutateAsync({ id, data: { status } })
        } catch (error) {
            console.error('Update ticket error:', error)
        }
    }

    const handleDeleteTicket = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa vé ăn này?')) return

        try {
            await deleteMutation.mutateAsync(id)
        } catch (error) {
            console.error('Delete ticket error:', error)
        }
    }

    const resetForm = () => {
        setSelectedDate(new Date().toISOString().split('T')[0])
        setSelectedProfileId('')
        setSelectedStatus(DINNER_TICKET_STATUS.ACTIVE)
        setSelectedType(DINNER_TICKETS_TYPE.LUNCH)
    }

    const handleFilterChange = (key: keyof FilterOptions, value: string | number | DINNER_TICKET_STATUS | DINNER_TICKETS_TYPE | undefined) => {
        setFilters(prev => ({
            ...prev,
            [key]: value || undefined,
        }))
    }

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Đang tải...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated || !user) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Quản lý bữa ăn</h1>
                                <p className="text-sm text-gray-600">THPT Chuyên Vĩnh Phúc</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">{user.username}</p>
                                <p className="text-xs text-gray-500">{user.type}</p>
                            </div>
                            <Button onClick={logout} variant="outline">
                                Đăng xuất
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
                    <StatCard title="Tổng số vé" value={stats.total.toString()} color="blue" />
                    <StatCard title="Đang hoạt động" value={stats.active.toString()} color="green" />
                    <StatCard title="Đã hủy" value={stats.cancelled.toString()} color="red" />
                    <StatCard title="Hôm nay" value={stats.today.toString()} color="purple" />
                    <StatCard title="Bữa trưa" value={stats.lunch.toString()} color="orange" />
                    <StatCard title="Bữa tối" value={stats.dinner.toString()} color="indigo" />
                </div>

                {/* Filters */}
                <Card className="p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Bộ lọc</h3>
                        <Button
                            onClick={() => setFilters({})}
                            variant="outline"
                            className="text-sm"
                        >
                            Xóa bộ lọc
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Class Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Lớp
                            </label>
                            <select
                                value={filters.classId || ''}
                                onChange={(e) => handleFilterChange('classId', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Tất cả lớp</option>
                                {classes.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ngày
                            </label>
                            <input
                                type="date"
                                value={filters.date || ''}
                                onChange={(e) => handleFilterChange('date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Month Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tháng
                            </label>
                            <select
                                value={filters.month || ''}
                                onChange={(e) => handleFilterChange('month', e.target.value ? parseInt(e.target.value) : undefined)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Tất cả tháng</option>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                    <option key={month} value={month}>Tháng {month}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Trạng thái
                            </label>
                            <select
                                value={filters.status || ''}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Tất cả</option>
                                <option value={DINNER_TICKET_STATUS.ACTIVE}>Hoạt động</option>
                                <option value={DINNER_TICKET_STATUS.CANCELLED}>Đã hủy</option>
                            </select>
                        </div>

                        {/* Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Loại bữa ăn
                            </label>
                            <select
                                value={filters.type || ''}
                                onChange={(e) => handleFilterChange('type', e.target.value ? parseInt(e.target.value) : undefined)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Tất cả</option>
                                <option value={DINNER_TICKETS_TYPE.LUNCH}>Bữa trưa</option>
                                <option value={DINNER_TICKETS_TYPE.DINNER}>Bữa tối</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Tab Switcher */}
                <div className="flex space-x-2 mb-6">
                    <button
                        onClick={() => setActiveTab('tickets')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'tickets'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <span>Danh sách vé ăn</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('statistics')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'statistics'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span>Thống kê chi tiết</span>
                        </div>
                    </button>
                </div>

                {/* Actions */}
                {activeTab === 'tickets' && (
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Danh sách vé ăn ({tickets.length})
                        </h2>
                        <Button onClick={() => setShowCreateModal(true)}>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Tạo vé ăn mới
                        </Button>
                    </div>
                )}

                {activeTab === 'statistics' && (
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Thống kê chi tiết ({statistics.length} học sinh)
                        </h2>
                    </div>
                )}

                {/* Tickets Table */}
                {activeTab === 'tickets' && (
                    <Card className="overflow-hidden">
                        {ticketsLoading ? (
                            <div className="p-12 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-600 mt-4">Đang tải...</p>
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="p-12 text-center">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <p className="text-gray-600">Không có vé ăn nào</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Ngày
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Học sinh
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Lớp
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Loại bữa ăn
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Trạng thái
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Thao tác
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {tickets.map(ticket => (
                                            <tr key={ticket.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(ticket.date).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {ticket.profile?.fullname || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {ticket.profile?.classEntity?.name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <TypeBadge type={ticket.type} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StatusBadge status={ticket.status} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                    {ticket.status === DINNER_TICKET_STATUS.ACTIVE && (
                                                        <button
                                                            onClick={() => handleUpdateTicket(ticket.id, DINNER_TICKET_STATUS.CANCELLED)}
                                                            className="text-orange-600 hover:text-orange-900"
                                                        >
                                                            Hủy
                                                        </button>
                                                    )}
                                                    {ticket.status === DINNER_TICKET_STATUS.CANCELLED && (
                                                        <button
                                                            onClick={() => handleUpdateTicket(ticket.id, DINNER_TICKET_STATUS.ACTIVE)}
                                                            className="text-green-600 hover:text-green-900"
                                                        >
                                                            Kích hoạt
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteTicket(ticket.id)}
                                                        className="text-red-600 hover:text-red-900 ml-4"
                                                    >
                                                        Xóa
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                )}

                {/* Statistics Table */}
                {activeTab === 'statistics' && (
                    <Card className="overflow-hidden">
                        {ticketsLoading ? (
                            <div className="p-12 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-600 mt-4">Đang tải...</p>
                            </div>
                        ) : statistics.length === 0 ? (
                            <div className="p-12 text-center">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <p className="text-gray-600">Không có dữ liệu thống kê</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                STT
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tên học sinh
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Mã học sinh
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Lớp
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                SĐT
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Suất trưa
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Suất tối
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tổng suất
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Đã hủy
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tổng tiền
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {statistics.map((stat, index) => (
                                            <tr key={stat.profileId} className="hover:bg-gray-50">
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {index + 1}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {stat.fullname}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {stat.studentId}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {stat.className}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {stat.phone || 'N/A'}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                        {stat.lunchCount}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                        {stat.dinnerCount}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {stat.totalCount}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        {stat.cancelledCount}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                                                    {stat.totalAmount.toLocaleString('vi-VN')}đ
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td colSpan={5} className="px-4 py-4 text-sm font-bold text-gray-900 text-right">
                                                TỔNG CỘNG:
                                            </td>
                                            <td className="px-4 py-4 text-sm text-center font-bold text-gray-900">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-200 text-orange-900">
                                                    {statistics.reduce((sum, stat) => sum + stat.lunchCount, 0)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-center font-bold text-gray-900">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-200 text-indigo-900">
                                                    {statistics.reduce((sum, stat) => sum + stat.dinnerCount, 0)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-center font-bold text-gray-900">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-200 text-blue-900">
                                                    {statistics.reduce((sum, stat) => sum + stat.totalCount, 0)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-center font-bold text-gray-900">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-200 text-red-900">
                                                    {statistics.reduce((sum, stat) => sum + stat.cancelledCount, 0)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-right font-bold text-blue-600">
                                                {statistics.reduce((sum, stat) => sum + stat.totalAmount, 0).toLocaleString('vi-VN')}đ
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </Card>
                )}
            </main>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Tạo vé ăn mới
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ngày
                                    </label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Profile ID
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedProfileId}
                                        onChange={(e) => setSelectedProfileId(e.target.value)}
                                        placeholder="Nhập Profile ID"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Loại bữa ăn
                                    </label>
                                    <select
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(parseInt(e.target.value) as DINNER_TICKETS_TYPE)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value={DINNER_TICKETS_TYPE.LUNCH}>Bữa trưa</option>
                                        <option value={DINNER_TICKETS_TYPE.DINNER}>Bữa tối</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Trạng thái
                                    </label>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value as DINNER_TICKET_STATUS)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value={DINNER_TICKET_STATUS.ACTIVE}>Hoạt động</option>
                                        <option value={DINNER_TICKET_STATUS.CANCELLED}>Đã hủy</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex space-x-3 mt-6">
                                <Button
                                    onClick={handleCreateTicket}
                                    disabled={createMutation.isPending || !selectedProfileId}
                                    className="flex-1"
                                >
                                    {createMutation.isPending ? 'Đang tạo...' : 'Tạo'}
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowCreateModal(false)
                                        resetForm()
                                    }}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Hủy
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}

function StatCard({ title, value, color }: { title: string; value: string; color: string }) {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        red: 'from-red-500 to-red-600',
        purple: 'from-purple-500 to-purple-600',
        orange: 'from-orange-500 to-orange-600',
        indigo: 'from-indigo-500 to-indigo-600',
    }[color]

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 text-sm mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`bg-gradient-to-br ${colorClasses} text-white p-3 rounded-xl`}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                </div>
            </div>
        </Card>
    )
}

function StatusBadge({ status }: { status: DINNER_TICKET_STATUS }) {
    const styles = status === DINNER_TICKET_STATUS.ACTIVE
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800'

    const label = status === DINNER_TICKET_STATUS.ACTIVE ? 'Hoạt động' : 'Đã hủy'

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles}`}>
            <span className={`w-2 h-2 ${status === DINNER_TICKET_STATUS.ACTIVE ? 'bg-green-500' : 'bg-red-500'} rounded-full mr-1`}></span>
            {label}
        </span>
    )
}

function TypeBadge({ type }: { type: DINNER_TICKETS_TYPE }) {
    const styles = type === DINNER_TICKETS_TYPE.LUNCH
        ? 'bg-orange-100 text-orange-800'
        : 'bg-indigo-100 text-indigo-800'

    const label = type === DINNER_TICKETS_TYPE.LUNCH ? 'Bữa trưa' : 'Bữa tối'

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles}`}>
            <span className={`w-2 h-2 ${type === DINNER_TICKETS_TYPE.LUNCH ? 'bg-orange-500' : 'bg-indigo-500'} rounded-full mr-1`}></span>
            {label}
        </span>
    )
}

