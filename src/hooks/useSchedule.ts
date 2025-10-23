'use client'

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "./apiClient"
import { Class } from "./useClass"
import { Teacher } from "./userUser"
import { Week } from "./useWeek"

export interface Schedule {
    id: string
    classId: string
    scheduleTime: number
    subject: string
    teacherId: string
    weekId: string
}

export interface getScheduleResponse extends Schedule {
    week: Week
    class: Class
    teacher: Teacher
}

const api = {
    getSchedules: async (classId?: string, teacherId?: string, weekId?: string, scheduleTime?: number, subject?: string): Promise<getScheduleResponse[]> => {
        const response = await apiClient.get('/schedules', {
            params: {
                classId,
                teacherId,
                weekId,
                scheduleTime,
                subject
            }
        })
        return response.data
    }
}

export const useGetAllSchedule = (weekId?: string) => {
    return useQuery<getScheduleResponse[]>({
        queryKey: ['all-schedule', weekId],
        queryFn: () => api.getSchedules(undefined, undefined, weekId),
        enabled: !!localStorage.getItem('token') && !!weekId,
    })
}