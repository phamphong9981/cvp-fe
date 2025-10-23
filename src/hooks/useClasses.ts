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
    return useQuery<Class[]>({
        queryKey: ['classes'],
        queryFn: api.getClasses
    })
}
