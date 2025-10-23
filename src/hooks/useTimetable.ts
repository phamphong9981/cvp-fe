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
    return useQuery<TimetableResponse>({
        queryKey: ['timetable', weekId],
        queryFn: () => api.getTimetable(weekId!),
        enabled: Boolean(weekId),
    })
}
