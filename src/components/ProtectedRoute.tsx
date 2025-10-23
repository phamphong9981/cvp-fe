'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
    children: React.ReactNode
    allowedRoles?: string[]
}

/**
 * Component bảo vệ route - chỉ cho phép người dùng đã đăng nhập truy cập
 * @param children - Nội dung cần bảo vệ
 * @param allowedRoles - Danh sách các role được phép truy cập (optional)
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const router = useRouter()
    const { user, isAuthenticated, isLoading } = useAuth()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login')
        }

        // Kiểm tra role nếu có yêu cầu
        if (
            !isLoading &&
            isAuthenticated &&
            allowedRoles &&
            allowedRoles.length > 0 &&
            user
        ) {
            if (!allowedRoles.includes(user.type)) {
                // Không có quyền truy cập
                router.push('/dashboard')
            }
        }
    }, [isAuthenticated, isLoading, router, allowedRoles, user])

    // Hiển thị loading khi đang kiểm tra authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Đang tải...</p>
                </div>
            </div>
        )
    }

    // Không hiển thị gì nếu chưa xác thực
    if (!isAuthenticated) {
        return null
    }

    // Kiểm tra role
    if (allowedRoles && allowedRoles.length > 0 && user) {
        if (!allowedRoles.includes(user.type)) {
            return null
        }
    }

    return <>{children}</>
}

