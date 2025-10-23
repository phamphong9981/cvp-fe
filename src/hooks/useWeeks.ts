'use client'

import { useEffect, useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from './apiClient'

export interface Week {
    id: string
    startDate: string
    endDate: string
    status: string
}

const api = {
    getWeeks: async (): Promise<Week[]> => {
        const response = await apiClient.get('/weeks')
        return response.data
    }
}

export const useGetWeeks = () => {
    return useQuery<Week[]>({
        queryKey: ['weeks'],
        queryFn: api.getWeeks
    })
}
