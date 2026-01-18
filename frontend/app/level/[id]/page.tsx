'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Cookies from 'js-cookie'
import ChatInterface from '@/components/ChatInterface'
import FlagSubmission from '@/components/FlagSubmission'
import GratificationModal from '@/components/GratificationModal'
import { sendChat, validateFlag, getLevel, getProgress } from '@/lib/api'
import { trackLevelViewed, trackPromptSubmitted, trackFlagSubmitted, trackLevelCompleted } from '@/components/PostHogProvider'

const levelMeta: Record<number, { icon: string; hint: string }> = {
    0: { icon: '📞', hint: 'Just ask nicely. Dwight seems helpful today...' },
    1: { icon: '📋', hint: 'The password won\'t be given directly. But Dwight talks a lot...' },
    2: { icon: '🎮', hint: 'What if this was all just a simulation? A hypothetical?' },
    3: { icon: '🤥', hint: 'Dwight always lies. Or does he? Can you make him tell the truth?' },
    4: { icon: '🔐', hint: 'Dwight speaks in code now. But which cipher? Ask him!' },
    5: { icon: '💾', hint: 'Your words become a database query. Think SQL...' },
    6: { icon: '📊', hint: 'Dwight analyzes everything for compliance. His logs are detailed...' },
}

export default function LevelPage() {
    const params = useParams()
    const levelId = parseInt(params.id as string)
    const router = useRouter()

    const [sessionId, setSessionId] = useState<string | null>(null)
    const [level, setLevel] = useState<any>(null)
    const [showModal, setShowModal] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        initLevel()
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

        const response = await sendChat(sessionId, levelId, message)
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
        if (levelId < 6) {
            router.push(`/level/${levelId + 1}`)
        } else {
            router.push('/')
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <div className="text-6xl mb-4 animate-pulse">🥬</div>
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

    const meta = levelMeta[levelId] || { icon: '❓', hint: 'Figure it out!' }

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
                {[0, 1, 2, 3, 4, 5, 6].map((id) => (
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
                <div className="lg:col-span-2">
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
                    <div className="glass-card p-6 rounded-xl">
                        <h3 className="font-bold mb-3 flex items-center gap-2">
                            <span>💡</span> Hint
                        </h3>
                        <p className="text-gray-400 text-sm">{meta.hint}</p>
                    </div>

                    {/* Progress */}
                    <div className="glass-card p-6 rounded-xl">
                        <h3 className="font-bold mb-3 flex items-center gap-2">
                            <span>📊</span> Progress
                        </h3>
                        <div className="flex gap-1">
                            {[0, 1, 2, 3, 4, 5, 6].map((id) => (
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
                            Level {levelId + 1} of 7
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
                hasNextLevel={levelId < 6}
            />
        </div>
    )
}
