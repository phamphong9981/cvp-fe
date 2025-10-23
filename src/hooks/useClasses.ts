'use client'

import { useEffect, useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from './apiClient'

export interface Class {
    id: string
    name: string
    grade?: string
    room?: string
}

const api = {
    getClasses: async (): Promise<Class[]> => {
        const response = await apiClient.get('/classes')
        return response.data
    }
}

export const useGetClasses = () => {
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

    const enabled = useMemo(() => hasToken, [hasToken])

    return useQuery<Class[]>({
        queryKey: ['classes'],
        queryFn: api.getClasses,
        enabled
    })
}
