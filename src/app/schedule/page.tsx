'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useGetTimetable } from '@/hooks/useTimetable'
import { useGetWeeks, Week } from '@/hooks/useWeeks'
import { useGetClasses } from '@/hooks/useClasses'
import { Class } from '@/hooks/useClass'
import { Teacher } from '@/hooks/userUser'
import { ScheduleSheet } from '@/components/ScheduleSheet'
import { ScheduleHeader } from '@/components/ScheduleHeader'
import { sampleClasses, sampleWeeks, sampleScheduleData } from '@/data/sampleSchedule'

// Interface cho dữ liệu lịch học
interface ScheduleData {
    id: string
    classId: string
    scheduleTime: number
    subject: string
    teacherId: string
    weekId: string
    week?: Week
    class: Class
    teacher: Teacher
}

// Interface cho dữ liệu tuần
interface WeekData {
    id: string
    startDate: string
    endDate: string
    status: string
}

export default function SchedulePage() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading: authLoading } = useAuth()
    const [selectedWeek, setSelectedWeek] = useState<string>('')
    const [weeks, setWeeks] = useState<WeekData[]>(sampleWeeks) // Initialize with sample data
    const [scheduleData, setScheduleData] = useState<ScheduleData[]>([])
    const [classes, setClasses] = useState<Class[]>(sampleClasses) // Initialize with sample data
    const [isLoading, setIsLoading] = useState(true)

    // Set default week immediately if not set
    useEffect(() => {
        if (!selectedWeek && sampleWeeks.length > 0) {
            setSelectedWeek(sampleWeeks[0].id)
        }
    }, [selectedWeek])

    // Lấy thông tin tuần hiện tại
    const currentWeek = weeks.find(w => w.id === selectedWeek)

    // Lấy danh sách tuần
    const { data: weeksData } = useGetWeeks()

    // Lấy danh sách lớp
    const { data: classesData } = useGetClasses()

    // Lấy lịch học từ API timetable
    const { data: timetableData, isLoading: scheduleLoading, error: timetableError } = useGetTimetable(selectedWeek)

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login')
        }
    }, [isAuthenticated, authLoading, router])

    useEffect(() => {
        if (weeksData && weeksData.length > 0) {
            setWeeks(weeksData)
            if (!selectedWeek) {
                setSelectedWeek(weeksData[0].id)
            }
        }
    }, [weeksData, selectedWeek])

    useEffect(() => {
        if (classesData && classesData.length > 0) {
            setClasses(classesData)
        }
    }, [classesData])

    useEffect(() => {
        if (timetableData) {
            // Chuyển đổi dữ liệu từ timetable format sang schedule format
            const convertedData: ScheduleData[] = []

            timetableData.timetable.forEach(classData => {
                classData.schedules.forEach(schedule => {
                    convertedData.push({
                        id: schedule.id,
                        classId: classData.classId,
                        scheduleTime: schedule.scheduleTime,
                        subject: schedule.subject,
                        teacherId: schedule.teacher.id,
                        weekId: timetableData.week.id,
                        class: {
                            id: classData.classId,
                            name: classData.className
                        },
                        teacher: {
                            id: schedule.teacher.id,
                            userId: schedule.teacher.id,
                            fullname: schedule.teacher.fullname
                        },
                        week: timetableData.week
                    })
                })
            })

            setScheduleData(convertedData)
        } else if (selectedWeek) {
            // Sử dụng dữ liệu mẫu khi có selectedWeek nhưng chưa có API data
            setScheduleData(sampleScheduleData)
        }
    }, [timetableData, selectedWeek])

    useEffect(() => {
        setIsLoading(authLoading || scheduleLoading)
    }, [authLoading, scheduleLoading])

    if (isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Đang tải lịch học...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4" style={{ maxWidth: '70%' }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Lịch học toàn trường</h1>
                                <p className="text-sm text-gray-600">THPT Chuyên Vĩnh Phúc</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Upload Button */}
                            <button
                                onClick={() => router.push('/schedule/upload')}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span>Upload CSV</span>
                            </button>

                            {/* Chọn tuần */}
                            <div className="flex items-center space-x-2">
                                <label className="text-sm font-medium text-gray-700">Tuần:</label>
                                <select
                                    value={selectedWeek}
                                    onChange={(e) => setSelectedWeek(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {weeks.map(week => (
                                        <option key={week.id} value={week.id}>
                                            {new Date(week.startDate).toLocaleDateString('vi-VN')} - {new Date(week.endDate).toLocaleDateString('vi-VN')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6" style={{ maxWidth: '70%' }}>
                {/* Header giống CSV */}
                <ScheduleHeader
                    weekInfo={currentWeek ? {
                        startDate: currentWeek.startDate,
                        endDate: currentWeek.endDate,
                        status: currentWeek.status
                    } : undefined}
                />

                <ScheduleSheet
                    scheduleData={scheduleData}
                    classes={timetableData?.timetable.map(t => ({ id: t.classId, name: t.className })) || classes}
                    selectedWeek={selectedWeek}
                    onWeekChange={setSelectedWeek}
                    weeks={weeks}
                    timetableData={timetableData}
                />
            </main>
        </div>
    )
}
