'use client'

import React, { useMemo } from 'react'
import { Card } from './ui/Card'

interface ParsedSchedule {
    className: string
    scheduleTime: number
    subject: string
    teacherName: string
}

interface TimetablePreviewProps {
    data: ParsedSchedule[]
    weekId: string
    onConfirm: () => void
    onCancel: () => void
    isUploading?: boolean
}

export function TimetablePreview({
    data,
    weekId,
    onConfirm,
    onCancel,
    isUploading = false
}: TimetablePreviewProps) {
    // Group data by class
    const groupedData = useMemo(() => {
        const grouped: { [className: string]: ParsedSchedule[] } = {}

        data.forEach(item => {
            if (!grouped[item.className]) {
                grouped[item.className] = []
            }
            grouped[item.className].push(item)
        })

        return grouped
    }, [data])

    // Get unique classes
    const classes = useMemo(() => {
        return Object.keys(groupedData).sort()
    }, [groupedData])

    // Get statistics
    const stats = useMemo(() => {
        const totalClasses = classes.length
        const totalSchedules = data.length
        const uniqueSubjects = new Set(data.map(item => item.subject)).size
        const uniqueTeachers = new Set(data.map(item => item.teacherName)).size

        return {
            totalClasses,
            totalSchedules,
            uniqueSubjects,
            uniqueTeachers
        }
    }, [classes.length, data])

    // Create schedule matrix for preview
    const createScheduleMatrix = () => {
        const days = ['Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy']
        const sessions = ['Sáng', 'Chiều']
        const morningPeriods = [1, 2, 3, 4, 5]
        const afternoonPeriods = ['Ca 1', 'Ca 2']

        const matrix: any[] = []

        days.forEach((day, dayIndex) => {
            // Morning periods
            morningPeriods.forEach((period, periodIndex) => {
                const row: any = {
                    day: periodIndex === 0 ? day : '',
                    session: periodIndex === 0 ? 'Sáng' : '',
                    period: period,
                    classes: {}
                }

                classes.forEach(className => {
                    const schedule = data.find(s =>
                        s.className === className &&
                        s.scheduleTime === (dayIndex * 7 + period)
                    )
                    if (schedule) {
                        row.classes[className] = {
                            subject: schedule.subject,
                            teacher: schedule.teacherName,
                            displayText: `${schedule.subject}-${schedule.teacherName}`
                        }
                    }
                })

                matrix.push(row)
            })

            // Afternoon periods
            afternoonPeriods.forEach((period, periodIndex) => {
                const row: any = {
                    day: periodIndex === 0 ? day : '',
                    session: periodIndex === 0 ? 'Chiều' : '',
                    period: period,
                    classes: {}
                }

                classes.forEach(className => {
                    const schedule = data.find(s =>
                        s.className === className &&
                        s.scheduleTime === (dayIndex * 7 + (period === 'Ca 1' ? 6 : 7))
                    )
                    if (schedule) {
                        row.classes[className] = {
                            subject: schedule.subject,
                            teacher: schedule.teacherName,
                            displayText: `${schedule.subject}-${schedule.teacherName}`
                        }
                    }
                })

                matrix.push(row)
            })
        })

        return matrix
    }

    const scheduleMatrix = createScheduleMatrix()

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="p-6">
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-blue-700 mb-2">
                        PREVIEW THỜI KHÓA BIỂU
                    </h3>
                    <p className="text-sm text-gray-600">
                        Kiểm tra dữ liệu trước khi upload
                    </p>
                </div>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Tổng số lớp</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Tổng số tiết</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalSchedules}</p>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Môn học</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.uniqueSubjects}</p>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Giáo viên</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.uniqueTeachers}</p>
                    </div>
                </Card>
            </div>

            {/* Schedule Table Preview */}
            <Card className="p-6">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            <tr>
                                <th className="px-3 py-2 text-center font-semibold border border-gray-300 min-w-[80px]">Thứ</th>
                                <th className="px-3 py-2 text-center font-semibold border border-gray-300 min-w-[80px]">Buổi</th>
                                <th className="px-3 py-2 text-center font-semibold border border-gray-300 min-w-[60px]">Tiết</th>
                                {classes.map((className, index) => (
                                    <th key={index} className="px-2 py-2 text-center font-semibold border border-gray-300 min-w-[120px] text-xs">
                                        {className}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {scheduleMatrix.map((row, rowIndex) => (
                                <tr key={`preview-${rowIndex}`} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                    <td className="px-3 py-2 text-center text-sm font-medium text-gray-700 border border-gray-300">
                                        {row.day}
                                    </td>
                                    <td className="px-3 py-2 text-center text-sm font-medium text-gray-700 border border-gray-300">
                                        {row.session}
                                    </td>
                                    <td className="px-3 py-2 text-center text-sm font-medium text-gray-700 border border-gray-300">
                                        {row.period}
                                    </td>
                                    {classes.map((className, classIndex) => {
                                        const schedule = row.classes[className]
                                        return (
                                            <td key={classIndex} className="px-2 py-2 border border-gray-300 min-h-[40px]">
                                                {schedule ? (
                                                    <div className="text-xs font-medium text-gray-800 text-center truncate">
                                                        {schedule.displayText}
                                                    </div>
                                                ) : (
                                                    <div className="h-8 flex items-center justify-center text-gray-400 text-xs">
                                                        -
                                                    </div>
                                                )}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
                <button
                    onClick={onCancel}
                    disabled={isUploading}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    Hủy
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isUploading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                    {isUploading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang upload...
                        </>
                    ) : (
                        'Xác nhận Upload'
                    )}
                </button>
            </div>
        </div>
    )
}
