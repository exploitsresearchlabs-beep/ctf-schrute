'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import Cookies from 'js-cookie'

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Only initialize PostHog if key is provided and consent is given
        const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
        const consent = Cookies.get('analytics_consent')

        if (posthogKey && consent === 'true') {
            posthog.init(posthogKey, {
                api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
                capture_pageview: true,
                capture_pageleave: true,
                persistence: 'localStorage+cookie',
                // Don't capture until consent
                opt_out_capturing_by_default: false,
            })
        }
    }, [])

    return <>{children}</>
}

// Analytics helper functions
export function trackEvent(eventName: string, properties?: Record<string, any>) {
    const consent = Cookies.get('analytics_consent')
    if (consent === 'true' && typeof window !== 'undefined' && (window as any).posthog) {
        posthog.capture(eventName, properties)
    }
}

export function trackLevelViewed(levelId: number) {
    trackEvent('level_viewed', { level_id: levelId })
}

export function trackPromptSubmitted(levelId: number, intentBucket: string) {
    trackEvent('prompt_submitted', { level_id: levelId, intent_bucket: intentBucket })
}

export function trackFlagSubmitted(levelId: number, isCorrect: boolean) {
    trackEvent('flag_submitted', { level_id: levelId, is_correct: isCorrect })
}

export function trackLevelCompleted(levelId: number) {
    trackEvent('level_completed', { level_id: levelId })
}
