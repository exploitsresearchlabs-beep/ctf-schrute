'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import Cookies from 'js-cookie'

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Only initialize PostHog if key is provided
        const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
        const consent = Cookies.get('analytics_consent')

        if (posthogKey) {
            posthog.init(posthogKey, {
                api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
                capture_pageview: true,
                capture_pageleave: true,
                persistence: 'localStorage+cookie',
                // Don't capture until consent is explicitly true
                opt_out_capturing_by_default: true,
            })

            // Make it available on window for ConsentBanner
            if (typeof window !== 'undefined') {
                (window as any).posthog = posthog

                // If consent was already given, opt in
                if (consent === 'true') {
                    posthog.opt_in_capturing()
                }
            }
        }
    }, [])

    return <>{children}</>
}

// Analytics helper functions
export function trackEvent(eventName: string, properties?: Record<string, any>) {
    const consent = Cookies.get('analytics_consent')
    if (consent === 'true') {
        posthog.capture(eventName, properties)
    }
}

export function trackLevelStarted(levelId: number) {
    trackEvent('level_started', { level_id: levelId })
}

export function trackPromptSubmitted(levelId: number, intentBucket: string) {
    trackEvent('prompt_submitted', { level_id: levelId, intent_bucket: intentBucket })
}

export function trackFlagSubmitted(levelId: number, isCorrect: boolean) {
    trackEvent('flag_submitted', { level_id: levelId, is_correct: isCorrect })
}

export function trackLevelCompleted(levelId: number, timeTakenSeconds?: number) {
    trackEvent('level_completed', { level_id: levelId, time_taken: timeTakenSeconds })
}
