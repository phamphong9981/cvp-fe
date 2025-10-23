'use client'

import { useMutation } from '@tanstack/react-query'
import { apiClient } from './apiClient'

export interface Teacher {
    id: string;
    userId: string;
    fullname: string;
}

export interface LoginData {
    username: string
    password: string
}

export interface LoginResponse {
    token: string
    username: string
    userId: string
    type: string
}

export const api = {
    login: async (data: LoginData): Promise<any> => {
        const response = await apiClient.post('/login', data)
        return response.data
    }
}

export function useLogin() {
    return useMutation({
        mutationFn: (data: LoginData) => api.login(data),
        onSuccess: (data) => {
            const dataLogin = data?.data
            localStorage.setItem('token', dataLogin?.token)
            localStorage.setItem('username', dataLogin?.username)
            localStorage.setItem('userId', dataLogin?.userId)
            localStorage.setItem('type', dataLogin?.type)
        },
        onError: (error) => {
            console.error('Login failed:', error)
        },
    })
}