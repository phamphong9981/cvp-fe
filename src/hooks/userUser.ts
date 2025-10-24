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

// Safe localStorage helpers
function safeSetItem(key: string, value: string) {
    if (typeof window === 'undefined') return
    try {
        console.log(`🔑 Setting ${key}:`, value)
        window.localStorage.setItem(key, value)
        // Verify it was set
        const verify = window.localStorage.getItem(key)
        console.log(`✅ Verified ${key}:`, verify)
    } catch (error) {
        console.error(`❌ Failed to set ${key}:`, error)
    }
}

export const api = {
    login: async (data: LoginData): Promise<any> => {
        const response = await apiClient.post('/login', data)
        console.log('📦 Full API Response:', response)
        console.log('📦 Response data:', response.data)
        return response.data
    }
}

export function useLogin() {
    return useMutation({
        mutationFn: (data: LoginData) => api.login(data),
        onSuccess: (data) => {
            console.log('🎯 onSuccess received data:', data)

            // Check if data is wrapped in a data property
            const dataLogin = data?.data || data
            console.log('🎯 dataLogin:', dataLogin)

            if (dataLogin?.token && dataLogin?.username && dataLogin?.userId && dataLogin?.type) {
                safeSetItem('token', dataLogin.token)
                safeSetItem('username', dataLogin.username)
                safeSetItem('userId', dataLogin.userId)
                safeSetItem('type', dataLogin.type)
                console.log('✅ All credentials saved to localStorage')
            } else {
                console.error('❌ Missing required fields in login response:', dataLogin)
            }
        },
        onError: (error) => {
            console.error('❌ Login failed:', error)
        },
    })
}