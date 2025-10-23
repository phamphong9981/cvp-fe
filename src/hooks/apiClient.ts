'use client'

import axios, { AxiosResponse } from 'axios'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// === Utility safe getter ===
function safeGetToken(): string | null {
    if (typeof window === 'undefined') return null
    try {
        return window.localStorage.getItem('token')
    } catch {
        return null
    }
}

// === Create axios instance ===
export const apiClient = axios.create({
    baseURL,
    timeout: 0,
    headers: {
        'Content-Type': 'application/json',
    },
})

// === Add request interceptor ===
apiClient.interceptors.request.use(
    (config) => {
        // 🚀 Logging (optional)
        if (typeof window !== 'undefined') {
            console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`)
        }

        // ✅ Add token only in browser
        const token = safeGetToken()
        if (token) {
            config.headers = config.headers || {}
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => Promise.reject(error)
)

// === Add response interceptor ===
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
        const msg = error?.response?.data || error.message
        if (typeof window !== 'undefined') console.error('❌ API Error:', msg)
        return Promise.reject(error)
    }
)
