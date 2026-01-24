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
            <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-300 text-center md:text-left">
                    <p>
                        🍪 We use analytics cookies to improve your experience.{' '}
                        <span className="text-gray-400 block sm:inline">No personal information is collected during gameplay.</span>
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto justify-center md:justify-end">
                    <button
                        onClick={handleDecline}
                        className="flex-1 md:flex-none px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors border border-gray-800 rounded-lg hover:bg-gray-800"
                    >
                        Decline
                    </button>
                    <button
                        onClick={handleAccept}
                        className="flex-1 md:flex-none px-4 py-2 text-sm bg-schrute-beet text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    )
}
