'use client'

import { useState } from 'react'
import Cookies from 'js-cookie'

export default function FeedbackPage() {
    const [comment, setComment] = useState('')
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
    const [authProvider, setAuthProvider] = useState<string | null>(null)

    const handleOAuthLogin = (provider: string) => {
        // In production, this would redirect to OAuth flow
        // For now, we'll simulate auth
        setAuthProvider(provider)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!comment.trim() || comment.length < 10) {
            setResult({ success: false, message: 'Feedback must be at least 10 characters.' })
            return
        }

        if (!authProvider) {
            setResult({ success: false, message: 'Please authenticate first.' })
            return
        }

        setIsSubmitting(true)
        setResult(null)

        try {
            const sessionId = Cookies.get('ctf_session_id')

            // In production, authUserId would come from OAuth callback
            const authUserId = `demo_${authProvider}_${Date.now()}`

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId || null,
                    comment_text: comment,
                    oauth_provider: authProvider,
                    oauth_user_id: authUserId,
                    email: email || null,
                }),
            })

            if (response.ok) {
                setResult({
                    success: true,
                    message: 'Thank you for your feedback! Dwight will review it personally.',
                })
                setComment('')
                setEmail('')
            } else {
                throw new Error('Failed to submit')
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
                {!authProvider && (
                    <div className="mb-8">
                        <h2 className="font-bold mb-4">Step 1: Authenticate</h2>
                        <p className="text-gray-400 text-sm mb-4">
                            Sign in to prevent spam. We only store your provider ID, not your email.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => handleOAuthLogin('google')}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <span>🔵</span> Google
                            </button>
                            <button
                                onClick={() => handleOAuthLogin('linkedin')}
                                className="flex items-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded-lg hover:bg-[#006399] transition-colors"
                            >
                                <span>in</span> LinkedIn
                            </button>
                            <button
                                onClick={() => handleOAuthLogin('twitter')}
                                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
                            >
                                <span>𝕏</span> X (Twitter)
                            </button>
                        </div>
                    </div>
                )}

                {authProvider && (
                    <div className="mb-6 p-3 bg-green-900/30 border border-green-500 rounded-lg">
                        <p className="text-green-300 text-sm flex items-center gap-2">
                            <span>✓</span> Authenticated with {authProvider}
                            <button
                                onClick={() => setAuthProvider(null)}
                                className="ml-auto text-xs text-gray-400 hover:text-white"
                            >
                                Change
                            </button>
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
                        disabled={!authProvider || !comment.trim() || isSubmitting}
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
