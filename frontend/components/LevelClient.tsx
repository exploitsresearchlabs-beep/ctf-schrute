'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import ChatInterface from '@/components/ChatInterface'
import FlagSubmission from '@/components/FlagSubmission'
import GratificationModal from '@/components/GratificationModal'
import { sendChat, validateFlag, getLevel, getProgress } from '@/lib/api'
import { trackLevelViewed, trackPromptSubmitted, trackFlagSubmitted, trackLevelCompleted } from '@/components/PostHogProvider'
import { LEVELS } from '@/lib/levels'

interface LevelClientProps {
    levelId: number
}

export default function LevelClient({ levelId }: LevelClientProps) {
    const router = useRouter()

    const [sessionId, setSessionId] = useState<string | null>(null)
    const [level, setLevel] = useState<any>(null)
    const [showHint, setShowHint] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [auditReport, setAuditReport] = useState(`AUDIT REPORT - QUARTER 4
Angela Martin, Head of Accounting

SUMMARY:
Internal audit shows 15% increase in beet-related expenses. 
Office supplies are within budget.

DETAILED FINDINGS:
- Paper sales: Stable
- Toner usage: High
- Beet farm subsidies: Significant

[End of Report]`)

    useEffect(() => {
        initLevel()
        setShowHint(false)
    }, [levelId])

    const initLevel = async () => {
        try {
            // Get session
            const session = Cookies.get('ctf_session_id')
            if (!session) {
                router.push('/')
                return
            }
            setSessionId(session)

            // Check if level is unlocked
            const progress = await getProgress(session)
            if (levelId > progress.current_level && !progress.completed_levels.includes(levelId)) {
                setError(`Level ${levelId} is locked. Complete previous levels first!`)
                return
            }

            // Get level info
            const levelData = await getLevel(levelId)
            setLevel(levelData)

            // Track analytics
            trackLevelViewed(levelId)
        } catch (err) {
            console.error('Failed to load level:', err)
            setError('Failed to load level. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSendMessage = async (message: string) => {
        if (!sessionId) throw new Error('No session')

        // Pass auditReport as context if Level 7
        const context = levelId === 7 ? auditReport : undefined
        const response = await sendChat(sessionId, levelId, message, context)
        trackPromptSubmitted(levelId, response.intent_bucket)
        return response
    }

    const handleSubmitFlag = async (flag: string) => {
        if (!sessionId) throw new Error('No session')

        const result = await validateFlag(sessionId, levelId, flag)
        trackFlagSubmitted(levelId, result.is_correct)

        if (result.is_correct) {
            trackLevelCompleted(levelId)
            setShowModal(true)
        }

        return result
    }

    const handleNextLevel = () => {
        setShowModal(false)
        if (levelId < 7) {
            router.push(`/level/${levelId + 1}`)
        } else {
            router.push('/')
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <div className="text-6xl mb-4 animate-pulse">🔒</div>
                <p className="text-gray-400">Loading level...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <div className="text-6xl mb-4">🔒</div>
                <p className="text-red-400 mb-4">{error}</p>
                <button onClick={() => router.push('/')} className="btn-secondary">
                    Back to Home
                </button>
            </div>
        )
    }

    const meta = LEVELS.find(l => l.id === levelId) || { id: levelId, name: 'Unknown', icon: '❓', hint: 'Figure it out!', difficulty: 'Easy' as const }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Level Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <span className="text-5xl">{meta.icon}</span>
                    <div>
                        <h1 className="text-3xl font-bold">
                            Level {levelId}: {level?.name || 'Unknown'}
                        </h1>
                        <p className="text-gray-400">{level?.description}</p>
                    </div>
                </div>

                {/* Security Lesson Badge */}
                <div className="inline-flex items-center gap-2 bg-schrute-darker px-4 py-2 rounded-lg">
                    <span className="text-schrute-gold">🔐 Security Lesson:</span>
                    <span className="text-gray-300 text-sm">{level?.security_lesson}</span>
                </div>
            </div>

            {/* Level Navigation */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((id) => (
                    <button
                        key={id}
                        onClick={() => router.push(`/level/${id}`)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${id === levelId
                            ? 'bg-schrute-beet text-white'
                            : 'bg-schrute-darker text-gray-400 hover:text-white'
                            }`}
                    >
                        Level {id}
                    </button>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Chat Interface - Takes 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                    {levelId === 7 && (
                        <div className="glass-card p-6 rounded-xl animate-fade-in-up">
                            <h3 className="font-bold mb-3 flex items-center gap-2 text-schrute-gold">
                                <span>📑</span> Angela's Audit Report
                            </h3>
                            <p className="text-xs text-gray-400 mb-4">
                                This report is currently on Dwight's desk. Any changes you make will be summarized when Dwight reads the report.
                            </p>
                            <textarea
                                value={auditReport}
                                onChange={(e) => setAuditReport(e.target.value)}
                                maxLength={2000}
                                className="w-full h-48 bg-black/40 border border-gray-700 rounded-lg p-3 text-sm font-mono text-gray-300 focus:border-schrute-beet outline-none transition-colors"
                                placeholder="Edit the report content here..."
                            />
                            <div className="flex justify-between mt-2">
                                <p className="text-[10px] text-gray-500 italic">
                                    * Dwight will detect if you try to submit excessively large reports.
                                </p>
                                <span className={`text-[10px] font-mono ${auditReport.length > 1800 ? 'text-schrute-gold' : 'text-gray-500'}`}>
                                    {auditReport.length}/2000
                                </span>
                            </div>
                        </div>
                    )}
                    <ChatInterface
                        onSendMessage={handleSendMessage}
                        levelId={levelId}
                        isLoading={isLoading}
                    />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Flag Submission */}
                    <FlagSubmission
                        onSubmit={handleSubmitFlag}
                        levelId={levelId}
                        isLoading={isLoading}
                    />

                    {/* Hint Box */}
                    <div
                        className="glass-card p-6 rounded-xl cursor-pointer hover:bg-white/5 transition-colors group"
                        onClick={() => setShowHint(!showHint)}
                    >
                        <h3 className="font-bold mb-3 flex items-center gap-2 group-hover:text-schrute-gold transition-colors">
                            <span>💡</span> Hint
                        </h3>
                        {showHint ? (
                            <p className="text-gray-400 text-sm animate-fade-in">{meta.hint}</p>
                        ) : (
                            <p className="text-gray-500 text-sm italic">Click to reveal hint...</p>
                        )}
                    </div>

                    {/* Progress */}
                    <div className="glass-card p-6 rounded-xl">
                        <h3 className="font-bold mb-3 flex items-center gap-2">
                            <span>📊</span> Progress
                        </h3>
                        <div className="flex gap-1">
                            {[0, 1, 2, 3, 4, 5, 6, 7].map((id) => (
                                <div
                                    key={id}
                                    className={`flex-1 h-2 rounded ${id < levelId
                                        ? 'bg-green-500'
                                        : id === levelId
                                            ? 'bg-schrute-gold'
                                            : 'bg-gray-700'
                                        }`}
                                />
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Level {levelId + 1} of 8
                        </p>
                    </div>
                </div>
            </div>

            {/* Gratification Modal */}
            <GratificationModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onNextLevel={handleNextLevel}
                levelId={levelId}
                hasNextLevel={levelId < 7}
            />
        </div>
    )
}
