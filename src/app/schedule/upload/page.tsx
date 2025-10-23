'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useGetWeeks } from '@/hooks/useWeeks'
import { useUploadTimetable, convertToUploadFormat } from '@/hooks/useUploadTimetable'
import { CSVUpload } from '@/components/CSVUpload'
import { TimetablePreview } from '@/components/TimetablePreview'
import { sampleWeeks } from '@/data/sampleSchedule'

interface ParsedSchedule {
    className: string
    scheduleTime: number
    subject: string
    teacherName: string
}

export default function UploadTimetablePage() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading: authLoading } = useAuth()
    const [selectedWeek, setSelectedWeek] = useState<string>('')
    const [parsedData, setParsedData] = useState<ParsedSchedule[]>([])
    const [showPreview, setShowPreview] = useState(false)

    const { data: weeksData } = useGetWeeks()
    const uploadMutation = useUploadTimetable()

    const weeks = weeksData || sampleWeeks

    // Set default week
    if (!selectedWeek && weeks.length > 0) {
        setSelectedWeek(weeks[0].id)
    }

    const handleFileSelect = (data: ParsedSchedule[]) => {
        setParsedData(data)
        setShowPreview(true)
    }

    const handleUpload = (data: ParsedSchedule[]) => {
        setParsedData(data)
        setShowPreview(true)
    }

    const handleConfirmUpload = async () => {
        if (!selectedWeek || parsedData.length === 0) return

        try {
            const uploadData = convertToUploadFormat(parsedData, selectedWeek)
            await uploadMutation.mutateAsync(uploadData)

            // Redirect to schedule page after successful upload
            router.push('/schedule')
        } catch (error) {
            console.error('Upload failed:', error)
        }
    }

    const handleCancel = () => {
        setShowPreview(false)
        setParsedData([])
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

    if (!isAuthenticated) {
        router.push('/login')
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4" style={{ maxWidth: '90%' }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push('/schedule')}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Upload Thời Khóa Biểu</h1>
                                <p className="text-sm text-gray-600">THPT Chuyên Vĩnh Phúc</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
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
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6" style={{ maxWidth: '90%' }}>
                {!showPreview ? (
                    <CSVUpload
                        onFileSelect={handleFileSelect}
                        onUpload={handleUpload}
                        isUploading={uploadMutation.isPending}
                    />
                ) : (
                    <TimetablePreview
                        data={parsedData}
                        weekId={selectedWeek}
                        onConfirm={handleConfirmUpload}
                        onCancel={handleCancel}
                        isUploading={uploadMutation.isPending}
                    />
                )}

                {/* Upload Status */}
                {uploadMutation.isError && (
                    <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                            <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium text-red-800">
                                Upload thất bại: {uploadMutation.error?.message}
                            </span>
                        </div>
                    </div>
                )}

                {uploadMutation.isSuccess && (
                    <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                            <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium text-green-800">
                                Upload thành công! Đang chuyển hướng...
                            </span>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
