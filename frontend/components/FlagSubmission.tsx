'use client'

import { useState } from 'react'

interface FlagSubmissionProps {
    onSubmit: (flag: string) => Promise<{ is_correct: boolean; message: string; next_level: number | null }>
    levelId: number
    isLoading?: boolean
}

export default function FlagSubmission({ onSubmit, levelId, isLoading = false }: FlagSubmissionProps) {
    const [flag, setFlag] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!flag.trim() || isSubmitting) return

        setIsSubmitting(true)
        setResult(null)

        try {
            const response = await onSubmit(flag.trim())

            setResult({
                success: response.is_correct,
                message: response.message,
            })

            if (response.is_correct) {
                setFlag('')
            }
        } catch (error) {
            setResult({
                success: false,
                message: 'Failed to submit flag. Please try again.',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="glass-card p-6 rounded-xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span>🚩</span> Submit Flag
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="flag" className="block text-sm text-gray-400 mb-2">
                        Found the secret? Enter the flag below:
                    </label>
                    <input
                        id="flag"
                        type="text"
                        value={flag}
                        onChange={(e) => setFlag(e.target.value)}
                        placeholder="Enter the flag here"
                        className="input-dark font-mono"
                        disabled={isSubmitting || isLoading}
                        autoComplete="off"
                    />
                </div>

                <button
                    type="submit"
                    disabled={!flag.trim() || isSubmitting || isLoading}
                    className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Validating...' : 'Submit Flag'}
                </button>
            </form>

            {result && (
                <div
                    className={`mt-4 p-4 rounded-lg ${result.success
                        ? 'bg-green-900/50 border border-green-500 text-green-300'
                        : 'bg-red-900/50 border border-red-500 text-red-300'
                        }`}
                >
                    <p className="flex items-center gap-2">
                        <span>{result.success ? '✅' : '❌'}</span>
                        {result.message}
                    </p>
                </div>
            )}
        </div>
    )
}
