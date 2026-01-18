'use client'

import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'

export default function ConsentBanner() {
    const [showBanner, setShowBanner] = useState(false)

    useEffect(() => {
        // Check if user has already consented
        const consent = Cookies.get('analytics_consent')
        if (consent === undefined) {
            setShowBanner(true)
        }
    }, [])

    const handleAccept = () => {
        Cookies.set('analytics_consent', 'true', { expires: 365 })
        setShowBanner(false)
        // Enable PostHog if available
        if (typeof window !== 'undefined' && (window as any).posthog) {
            (window as any).posthog.opt_in_capturing()
        }
    }

    const handleDecline = () => {
        Cookies.set('analytics_consent', 'false', { expires: 365 })
        setShowBanner(false)
        // Disable PostHog if available
        if (typeof window !== 'undefined' && (window as any).posthog) {
            (window as any).posthog.opt_out_capturing()
        }
    }

    if (!showBanner) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-schrute-darker/95 border-t border-gray-800 backdrop-blur-sm">
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-300">
                    <p>
                        🍪 We use analytics cookies to improve your experience.{' '}
                        <span className="text-gray-400">No personal information is collected during gameplay.</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleDecline}
                        className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Decline
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-4 py-2 text-sm bg-schrute-beet text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    )
}
