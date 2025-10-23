'use client'

import { useEffect, useMemo, useState } from 'react'
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
    },
}

export const useGetWeeks = () => {
    const [hasToken, setHasToken] = useState(false)

    // ✅ Chỉ đọc localStorage sau khi chắc chắn đang ở client
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                setHasToken(!!window.localStorage.getItem('token'))
            } catch {
                setHasToken(false)
            }
        }
    }, [])

    const enabled = useMemo(() => hasToken, [hasToken])

    return useQuery<Week[]>({
        queryKey: ['weeks'],
        queryFn: api.getWeeks,
        enabled,
    })
}
