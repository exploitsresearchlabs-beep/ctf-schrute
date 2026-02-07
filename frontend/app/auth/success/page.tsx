
'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Cookies from 'js-cookie'

function AuthSuccessHandler() {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const token = searchParams.get('token')
        if (token) {
            // Save token for 7 days
            Cookies.set('auth_token', token, { expires: 7 })

            // Redirect back home or to play
            router.push('/level/1')
        } else {
            router.push('/')
        }
    }, [router, searchParams])

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
