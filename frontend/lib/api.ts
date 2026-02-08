/**
 * API client for communicating with the FastAPI backend.
 * All calls are made to the backend API server.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Create a new anonymous session.
 */
export async function createSession(posthogId?: string) {
    const response = await fetch(`${API_URL}/api/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posthog_distinct_id: posthogId || null }),
    })

    if (!response.ok) {
        throw new Error('Failed to create session')
    }

    return response.json()
}

/**
 * Get session progress.
 */
export async function getProgress(sessionId: string) {
    const response = await fetch(`${API_URL}/api/session/${sessionId}`)

    if (!response.ok) {
        return { exists: false, current_level: 1, completed_levels: [] }
    }

    const data = await response.json()
    return { ...data, exists: true }
}

/**
 * Get level information.
 */
export async function getLevel(levelId: number) {
    const response = await fetch(`${API_URL}/api/levels/${levelId}`)

    if (!response.ok) {
        throw new Error('Failed to get level')
    }

    return response.json()
}

/**
 * Get all levels.
 */
export async function getAllLevels() {
    const response = await fetch(`${API_URL}/api/levels`)

    if (!response.ok) {
        throw new Error('Failed to get levels')
    }

    return response.json()
}

/**
 * Send a chat message to Dwight.
 */
export async function sendChat(sessionId: string, levelId: number, prompt: string, context?: string) {
    const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_id: sessionId,
            level_id: levelId,
            prompt: prompt,
            context: context || null,
        }),
    })

    if (!response.ok) {
        if (response.status === 429) {
            return {
                response: "SLOW DOWN. You're trying too hard. Take a breath.",
                intent_bucket: 'WRONG',
                is_rate_limited: true,
            }
        }
        throw new Error('Failed to send chat')
    }

    return response.json()
}

/**
 * Validate a flag submission.
 */
export async function validateFlag(sessionId: string, levelId: number, flag: string) {
    const response = await fetch(`${API_URL}/api/validate-flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_id: sessionId,
            level_id: levelId,
            flag: flag,
        }),
    })

    if (!response.ok) {
        if (response.status === 429) {
            return {
                is_correct: false,
                message: 'Too many attempts. Wait a moment before trying again.',
                next_level: null,
            }
        }
        throw new Error('Failed to validate flag')
    }

    return response.json()
}

/**
 * Submit feedback.
 */
export async function submitFeedback(
    sessionId: string | null,
    comment: string,
    oauthProvider: string,
    oauthUserId: string,
    email?: string
) {
    const response = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_id: sessionId,
            comment_text: comment,
            oauth_provider: oauthProvider,
            oauth_user_id: oauthUserId,
            email: email || null,
        }),
    })

    if (!response.ok) {
        throw new Error('Failed to submit feedback')
    }

    return response.json()
}
