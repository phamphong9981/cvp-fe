'use client';

import { useEffect, useState, useCallback } from 'react';

interface User {
    username: string;
    token: string;
    userId: string;
    type: string;
}

/** Tránh crash khi localStorage bị chặn/không tồn tại (Edge/SSR/iframe/privacy) */
function safeGet(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
}

function safeSet(key: string, value: string) {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        window.localStorage.setItem(key, value);
        // Verify it was set
        const verify = window.localStorage.getItem(key);
        console.log(`✅ useAuth verified ${key}:`, verify);
    } catch (error) {
        console.error(`❌ useAuth failed to set ${key}:`, error);
    }
}

function safeRemove(key: string) {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.removeItem(key);
    } catch { }
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Đọc trạng thái đăng nhập chỉ sau khi đã chắc chắn đang ở client
    useEffect(() => {
        // guard 1: chỉ chạy trên client
        if (typeof window === 'undefined') {
            setIsLoading(false);
            return;
        }

        // guard 2: bọc try/catch để tránh DOMException (quota, private mode, v.v.)
        try {
            const token = safeGet('token');
            const username = safeGet('username');
            const userId = safeGet('userId');
            const type = safeGet('type');

            if (token && username && userId && type) {
                setUser({ token, username, userId, type });
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = useCallback((userData: User) => {
        setUser(userData);
        // (tuỳ chọn) đồng bộ lại storage một cách an toàn
        safeSet('token', userData.token);
        safeSet('username', userData.username);
        safeSet('userId', userData.userId);
        safeSet('type', userData.type);
    }, []);

    const logout = useCallback(() => {
        safeRemove('token');
        safeRemove('username');
        safeRemove('userId');
        safeRemove('type');
        setUser(null);
        if (typeof window !== 'undefined') {
            // dùng replace để không quay lại trang bảo vệ
            window.location.replace('/login');
        }
    }, []);

    return {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
    };
}
