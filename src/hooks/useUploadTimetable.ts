'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './apiClient'

interface ParsedSchedule {
    className: string
    scheduleTime: number
    subject: string
    teacherName: string
}

interface UploadTimetableRequest {
    weekId: string
    timetable: {
        className: string
        schedules: {
            scheduleTime: number
            subject: string
            teacherName: string
        }[]
    }[]
}

interface UploadTimetableResponse {
    message: string
    successCount: number
    skipCount: number
    errorCount: number
    errors: string[]
    totalClasses: number
    totalSchedules: number
}

const api = {
    uploadTimetable: async (data: UploadTimetableRequest): Promise<UploadTimetableResponse> => {
        const response = await apiClient.post('/schedules/upload-timetable', data)
        return response.data
    }
}

export const useUploadTimetable = () => {
    const queryClient = useQueryClient()

    return useMutation<UploadTimetableResponse, Error, UploadTimetableRequest>({
        mutationFn: api.uploadTimetable,
        onSuccess: (data) => {
            // Invalidate và refetch timetable data
            queryClient.invalidateQueries({ queryKey: ['timetable'] })
            queryClient.invalidateQueries({ queryKey: ['all-schedule'] })

            console.log('✅ Upload thành công:', data)
        },
        onError: (error) => {
            console.error('❌ Upload thất bại:', error)
        }
    })
}

// Helper function để convert parsed data thành format API
export const convertToUploadFormat = (parsedData: ParsedSchedule[], weekId: string): UploadTimetableRequest => {
    // Group by className
    const groupedData: { [className: string]: ParsedSchedule[] } = {}

    parsedData.forEach(item => {
        if (!groupedData[item.className]) {
            groupedData[item.className] = []
        }
        groupedData[item.className].push(item)
    })

    // Convert to API format
    const timetable = Object.entries(groupedData).map(([className, schedules]) => ({
        className,
        schedules: schedules.map(schedule => ({
            scheduleTime: schedule.scheduleTime,
            subject: schedule.subject,
            teacherName: schedule.teacherName
        }))
    }))

    return {
        weekId,
        timetable
    }
}
