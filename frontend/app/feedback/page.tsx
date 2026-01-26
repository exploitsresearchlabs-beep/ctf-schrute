'use client'

import { useState } from 'react'
import Cookies from 'js-cookie'
import { trackEvent } from '@/components/PostHogProvider'
import { useUser } from '@/components/UserContext'

export default function FeedbackPage() {
    const { user, loading, login } = useUser()
    const [comment, setComment] = useState('')
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!comment.trim() || comment.length < 10) {
            setResult({ success: false, message: 'Feedback must be at least 10 characters.' })
            return
        }

        if (!user) {
            setResult({ success: false, message: 'Please authenticate first.' })
            return
        }

        setIsSubmitting(true)
        setResult(null)

        try {
            const sessionId = Cookies.get('ctf_session_id')
            const token = Cookies.get('auth_token')

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    session_id: sessionId || null,
                    comment_text: comment,
                    email: email || null,
                }),
            })

            if (response.ok) {
                // Track feedback submission
                trackEvent('feedback_submitted', { provider: user.provider })

                setResult({
                    success: true,
                    message: 'Thank you for your feedback! Dwight will review it personally.',
                })
                setComment('')
                setEmail('')
            } else {
                const errorData = await response.json()
                throw new Error(errorData.detail || 'Failed to submit')
            }
        } catch (error) {
            setResult({
                success: false,
                message: 'Failed to submit feedback. Please try again.',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-schrute-gold"></div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Feedback</h1>
                <p className="text-gray-400">
                    Completed the game? Let us know what you think!
                </p>
            </div>

            <div className="glass-card p-8 rounded-xl">
                {/* OAuth Login */}
                {!user && (
                    <div className="mb-8 text-center">
                        <h2 className="font-bold mb-4">Step 1: Authenticate</h2>
                        <p className="text-gray-400 text-sm mb-6">
                            Sign in to prevent spam. We only store your provider ID, not your email.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <button
                                onClick={() => login('google')}
                                className="flex items-center gap-3 px-6 py-3 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-all font-medium"
                            >
                                <span className="text-xl">G</span> Google
                            </button>
                            <button
                                onClick={() => login('github')}
                                className="flex items-center gap-3 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all font-medium"
                            >
                                <span className="text-xl">🐱</span> GitHub
                            </button>
                        </div>
                    </div>
                )}

                {user && (
                    <div className="mb-6 p-3 bg-green-900/30 border border-green-500 rounded-lg">
                        <p className="text-green-300 text-sm flex items-center gap-2">
                            <span>✓</span> Authenticated as <span className="font-bold underline">{user.name || user.email}</span>
                        </p>
                    </div>
                )}

                {/* Feedback Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="comment" className="block text-sm font-medium mb-2">
                            Your Feedback *
                        </label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="What did you think of the game? Any suggestions?"
                            className="input-dark h-32 resize-none"
                            maxLength={2000}
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {comment.length}/2000 characters
                        </p>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                            Email (optional)
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="input-dark"
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Only if you want us to follow up with you.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={!user || !comment.trim() || isSubmitting}
                        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                </form>

                {result && (
                    <div
                        className={`mt-6 p-4 rounded-lg ${result.success
                            ? 'bg-green-900/50 border border-green-500 text-green-300'
                            : 'bg-red-900/50 border border-red-500 text-red-300'
                            }`}
                    >
                        <p>{result.message}</p>
                    </div>
                )}
            </div>

            {/* Contact Info */}
            <div className="text-center mt-8 text-gray-500 text-sm">
                <p>
                    Have questions? Contact us at{' '}
                    <a
                        href="mailto:exploitsresearchlabs@gmail.com"
                        className="text-schrute-gold hover:underline"
                    >
                        exploitsresearchlabs@gmail.com
                    </a>
                </p>
            </div>
        </div>
    )
}
