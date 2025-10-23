'use client'

import React, { useState } from 'react'
import { ScheduleTable } from './ScheduleTable'

interface ScheduleItem {
    id: string
    classId: string
    scheduleTime: number
    subject: string
    teacherId: string
    weekId: string
    class: {
        id: string
        name: string
    }
    teacher: {
        id: string
        fullname: string
    }
}

interface ScheduleSheetProps {
    scheduleData: ScheduleItem[]
    classes: Array<{ id: string; name: string }>
    selectedWeek: string
    onWeekChange: (weekId: string) => void
    weeks: Array<{ id: string; startDate: string; endDate: string; status: string }>
    timetableData?: {
        week: {
            id: string
            startDate: string
            endDate: string
            status: string
        }
        timetable: Array<{
            classId: string
            className: string
            schedules: Array<{
                id: string
                scheduleTime: number
                subject: string
                teacher: {
                    id: string
                    fullname: string
                }
            }>
        }>
        totalClasses: number
        totalSchedules: number
    }
}

export function ScheduleSheet({
    scheduleData,
    classes,
    selectedWeek,
    onWeekChange,
    weeks,
    timetableData
}: ScheduleSheetProps) {
    const [viewMode, setViewMode] = useState<'all' | 'class'>('all')
    const [selectedClass, setSelectedClass] = useState<string>('')

    // helper tách slot
    const splitSlot = (slot: number) => {
        const idx = slot - 1
        const dayIndex = Math.floor(idx / 7)   // 0..5 (Hai..Bảy)
        const period = (idx % 7) + 1         // 1..7
        return { dayIndex, period }
    }

    // map period → buổi
    const periodToSession = (p: number) => (p <= 5 ? 'Sáng' : 'Chiều')

    // Lọc theo week + (class nếu "Theo lớp")
    const base = scheduleData.filter(s => s.weekId === selectedWeek)
    const filtered = (viewMode === 'class' && selectedClass)
        ? base.filter(s => s.classId === selectedClass)
        : base

    // Chuẩn hoá dữ liệu cho bảng (thêm dayIndex, period, session)
    const normalizedData = filtered.map(s => {
        const { dayIndex, period } = splitSlot(s.scheduleTime)
        return {
            ...s,
            // props bổ sung để table dựng đúng ô
            dayIndex,            // 0..5
            period,              // 1..7
            session: periodToSession(period) as 'Sáng' | 'Chiều',
        }
    })

    const currentWeek = weeks.find(w => w.id === selectedWeek)

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Tuần:</label>
                            <select
                                value={selectedWeek}
                                onChange={(e) => onWeekChange(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {weeks.map(week => (
                                    <option key={week.id} value={week.id}>
                                        {new Date(week.startDate).toLocaleDateString('vi-VN')} - {new Date(week.endDate).toLocaleDateString('vi-VN')}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Chế độ xem:</label>
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('all')}
                                    className={`px-3 py-1 text-sm rounded-md transition-all ${viewMode === 'all'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Toàn trường
                                </button>
                                <button
                                    onClick={() => setViewMode('class')}
                                    className={`px-3 py-1 text-sm rounded-md transition-all ${viewMode === 'class'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Theo lớp
                                </button>
                            </div>
                        </div>

                        {viewMode === 'class' && (
                            <div className="flex items-center space-x-2">
                                <label className="text-sm font-medium text-gray-700">Lớp:</label>
                                <select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Chọn lớp</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="text-sm text-gray-600">
                        {currentWeek && (
                            <span>
                                {new Date(currentWeek.startDate).toLocaleDateString('vi-VN')} - {new Date(currentWeek.endDate).toLocaleDateString('vi-VN')}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Schedule Table */}
            <ScheduleTable
                scheduleData={normalizedData as any}
                classes={classes}
                selectedWeek={selectedWeek}
            />

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Tổng số lớp</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {timetableData?.totalClasses || classes.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Tổng số tiết</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {timetableData?.totalSchedules || scheduleData.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Giáo viên</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {timetableData ?
                                    new Set(timetableData.timetable.flatMap(t => t.schedules.map(s => s.teacher.id))).size :
                                    new Set(scheduleData.map(s => s.teacherId)).size
                                }
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Môn học</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {timetableData ?
                                    new Set(timetableData.timetable.flatMap(t => t.schedules.map(s => s.subject))).size :
                                    new Set(scheduleData.map(s => s.subject)).size
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
