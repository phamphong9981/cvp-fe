'use client';

import { useState, useEffect } from 'react';

interface User {
    username: string;
    token: string;
    userId: string;
    type: string
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        const userId = localStorage.getItem('userId');
        const type = localStorage.getItem('type');

        if (token && username && userId && type) {
            setUser({
                username,
                token,
                userId,
                type
            });
        }
        setIsLoading(false);
    }, []);

    const login = (userData: User) => {
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        localStorage.removeItem('type');
        setUser(null);
        window.location.reload()
    }

    return {
        user,
        isLoading,
        login,
        // loginWithCredentials,
        logout,
        isAuthenticated: !!user
    };
}