
'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Cookies from 'js-cookie'
import { useUser } from '@/components/UserContext'

function AuthSuccessHandler() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { refreshUser } = useUser()

    useEffect(() => {
        const token = searchParams.get('token')
        const next = searchParams.get('next')

        if (token) {
            // Save token for 7 days
            Cookies.set('auth_token', token, { expires: 7 })

            // Refresh user state and then redirect
            refreshUser().then(() => {
                if (next && next.startsWith('/')) {
                    router.push(next)
                } else {
                    router.push('/level/1')
                }
            })
        } else {
            router.push('/')
        }
    }, [router, searchParams, refreshUser])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-schrute-gold mx-auto mb-4"></div>
                <p className="text-gray-400">Authenticating with Schrute Farms... Please wait.</p>
            </div>
        </div>
    )
}

export default function AuthSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthSuccessHandler />
        </Suspense>
    )
}
