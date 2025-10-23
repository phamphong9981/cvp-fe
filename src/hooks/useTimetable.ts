'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from './apiClient'

export interface TimetableTeacher { id: string; fullname: string }
export interface TimetableSchedule { id: string; scheduleTime: number; subject: string; teacher: TimetableTeacher }
export interface TimetableClass { classId: string; className: string; schedules: TimetableSchedule[] }
export interface TimetableWeek { id: string; startDate: string; endDate: string; status: string }
export interface TimetableResponse {
    week: TimetableWeek
    timetable: TimetableClass[]
    totalClasses: number
    totalSchedules: number
}

const api = {
    getTimetable: async (weekId: string): Promise<TimetableResponse> => {
        const res = await apiClient.get(`/schedules/timetable`, { params: { weekId } })
        return res.data
    },
}

export const useGetTimetable = (weekId?: string) => {
    // Đọc token một lần sau khi chắc chắn đang ở client
    const [hasToken, setHasToken] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                setHasToken(!!window.localStorage.getItem('token'))
            } catch {
                setHasToken(false)
            }
        }
    }, [])

    const enabled = useMemo(() => Boolean(weekId) && hasToken, [weekId, hasToken])

    return useQuery<TimetableResponse>({
        queryKey: ['timetable', weekId],
        queryFn: () => api.getTimetable(weekId!),
        enabled,
    })
}
