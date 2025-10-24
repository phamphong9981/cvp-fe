'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './apiClient'

// ============= Types =============
export enum DINNER_TICKET_STATUS {
    ACTIVE = 'active',
    CANCELLED = 'cancelled'
}

export enum DINNER_TICKETS_TYPE {
    LUNCH = 1,
    DINNER = 2
}
export interface Profile {
    id: string
    fullname: string
    phone?: string
    classId: string
    classEntity?: {
        id: string
        name: string
    }
}

export interface DinnerTicket {
    id: string
    date: string
    profileId: string
    status: DINNER_TICKET_STATUS
    createdAt: string
    updatedAt: string
    profile?: Profile
    type: DINNER_TICKETS_TYPE
}

export interface CreateDinnerTicketDto {
    date: string
    status?: DINNER_TICKET_STATUS
    profileId?: string
    type: DINNER_TICKETS_TYPE
}

export interface UpdateDinnerTicketDto {
    date?: string
    status?: DINNER_TICKET_STATUS
    profileId?: string
}

export interface FilterOptions {
    classId?: string
    date?: string
    year?: number
    month?: number
    profileId?: string
    status?: DINNER_TICKET_STATUS
    type?: DINNER_TICKETS_TYPE
}

// ============= User API =============
export function useGetUserTickets(year?: number, month?: number) {
    return useQuery({
        queryKey: ['dinner-tickets', 'user', year, month],
        queryFn: async () => {
            const params = new URLSearchParams()
            if (year) params.append('year', year.toString())
            if (month) params.append('month', month.toString())

            const response = await apiClient.get(`/dinner-tickets/user?${params.toString()}`)
            return response.data as DinnerTicket[]
        },
        staleTime: 30000,
    })
}

export function useGetUserTicket(id: string) {
    return useQuery({
        queryKey: ['dinner-tickets', 'user', id],
        queryFn: async () => {
            const response = await apiClient.get(`/dinner-tickets/${id}`)
            return response.data as DinnerTicket
        },
        enabled: Boolean(id),
    })
}

export function useCreateUserTicket() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: CreateDinnerTicketDto) => {
            const response = await apiClient.post('/dinner-tickets', data)
            return response.data as DinnerTicket
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dinner-tickets', 'user'] })
        },
    })
}

export function useUpdateUserTicket() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateDinnerTicketDto }) => {
            const response = await apiClient.put(`/dinner-tickets/${id}`, data)
            return response.data as DinnerTicket
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dinner-tickets', 'user'] })
        },
    })
}

// ============= Admin API =============
export function useGetAdminTickets(filters?: FilterOptions) {
    return useQuery({
        queryKey: ['dinner-tickets', 'admin', filters],
        queryFn: async () => {
            const response = await apiClient.get('/admin/dinner-tickets', { params: filters })
            return response.data as DinnerTicket[]
        },
        staleTime: 30000,
    })
}

export function useGetAdminTicket(id: string) {
    return useQuery({
        queryKey: ['dinner-tickets', 'admin', id],
        queryFn: async () => {
            const response = await apiClient.get(`/admin/dinner-tickets/${id}`)
            return response.data as DinnerTicket
        },
        enabled: Boolean(id),
    })
}

export function useCreateAdminTicket() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: CreateDinnerTicketDto) => {
            const response = await apiClient.post('/admin/dinner-tickets', data)
            return response.data as DinnerTicket
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dinner-tickets', 'admin'] })
        },
    })
}

export function useUpdateAdminTicket() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateDinnerTicketDto }) => {
            const response = await apiClient.put(`/admin/dinner-tickets/${id}`, data)
            return response.data as DinnerTicket
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dinner-tickets', 'admin'] })
        },
    })
}

export function useDeleteAdminTicket() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await apiClient.delete(`/admin/dinner-tickets/${id}`)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dinner-tickets', 'admin'] })
        },
    })
}

