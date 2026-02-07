'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { v4 as uuidv4 } from 'uuid'
import { createSession, getProgress } from '@/lib/api'
import { LEVELS } from '@/lib/levels'

export default function HomeClient() {
    const router = useRouter()
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [currentLevel, setCurrentLevel] = useState(0)
    const [completedLevels, setCompletedLevels] = useState<number[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        initSession()
    }, [])

    const initSession = async () => {
        try {
            // Check for existing session
            let existingSession = Cookies.get('ctf_session_id')

            if (existingSession) {
                // Verify and get progress
                const progress = await getProgress(existingSession)
                if (progress.exists) {
                    setSessionId(existingSession)
                    setCurrentLevel(progress.current_level)
                    setCompletedLevels(progress.completed_levels)
                    setIsLoading(false)
                    return
                }
            }

            // Create new session
            const session = await createSession()
            Cookies.set('ctf_session_id', session.session_id, { expires: 365 })
            localStorage.setItem('ctf_session_id', session.session_id)
            setSessionId(session.session_id)
            setCurrentLevel(1)
            setCompletedLevels([])
        } catch (error) {
            console.error('Failed to initialize session:', error)
            // Create local fallback
            const fallbackId = uuidv4()
            Cookies.set('ctf_session_id', fallbackId, { expires: 365 })
            setSessionId(fallbackId)
        } finally {
            setIsLoading(false)
        }
    }

    const handleStartGame = () => {
        router.push(`/level/${currentLevel}`)
    }

    const handleLevelClick = (levelId: number) => {
        if (levelId <= currentLevel || completedLevels.includes(levelId)) {
            router.push(`/level/${levelId}`)
        }
    }

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Hero Section */}
            <section className="text-center mb-16 animate-fade-in">
                <div className="relative w-64 h-64 mx-auto mb-8">
                    <Image
                        src="/logo.png"
                        alt="Schrute CTF Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
                <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-schrute-beet via-red-500 to-schrute-gold bg-clip-text text-transparent text-balance">
                    Schrute CTF
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto text-pretty">
                    Can you outsmart Dwight? Learn how <span className="text-schrute-gold">prompt injection</span> and{' '}
                    <span className="text-schrute-gold">over-privileged chatbots</span> lead to data leaks.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={handleStartGame}
                        className="btn-primary text-lg px-8 py-4"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Loading...' : currentLevel > 1 ? `Continue Level ${currentLevel}` : 'Start Game'}
                    </button>

                    {completedLevels.length > 0 && (
                        <span className="badge badge-success">
                            {completedLevels.length}/8 Levels Complete
                        </span>
                    )}
                </div>
            </section>

            {/* How It Works */}
            <section className="mb-16">
                <h2 className="text-3xl font-bold text-center mb-8 text-schrute-gold">How It Works</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="glass-card p-6 rounded-xl text-center">
                        <div className="text-4xl mb-4">💬</div>
                        <h3 className="text-xl font-bold mb-2">Chat with Dwight</h3>
                        <p className="text-gray-400">
                            Each level features a chatbot with different security flaws. Find the vulnerability!
                        </p>
                    </div>
                    <div className="glass-card p-6 rounded-xl text-center">
                        <div className="text-4xl mb-4">🔓</div>
                        <h3 className="text-xl font-bold mb-2">Extract the Secret</h3>
                        <p className="text-gray-400">
                            Use prompt injection techniques to trick the bot into revealing the password.
                        </p>
                    </div>
                    <div className="glass-card p-6 rounded-xl text-center">
                        <div className="text-4xl mb-4">🚩</div>
                        <h3 className="text-xl font-bold mb-2">Capture the Flag</h3>
                        <p className="text-gray-400">
                            Submit the flag to prove you've learned the security lesson. Level up!
                        </p>
                    </div>
                </div>
            </section>

            {/* Levels Overview */}
            <section className="mb-16">
                <h2 className="text-3xl font-bold text-center mb-8 text-schrute-gold">7 Levels of Security</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {LEVELS.map((level) => {
                        const isUnlocked = level.id <= currentLevel || completedLevels.includes(level.id)
                        const isCompleted = completedLevels.includes(level.id)

                        return (
                            <div
                                key={level.id}
                                onClick={() => handleLevelClick(level.id)}
                                className={`level-card ${!isUnlocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-3xl">{level.icon}</span>
                                    {isCompleted && <span className="text-green-400">✓</span>}
                                    {!isUnlocked && <span className="text-gray-500">🔒</span>}
                                </div>
                                <h3 className="font-bold mb-1">Level {level.id}</h3>
                                <p className="text-sm text-gray-400 mb-2">{level.name}</p>
                                <span className={`badge ${level.difficulty === 'Easy' ? 'badge-success' :
                                    level.difficulty === 'Medium' ? 'badge-warning' : 'badge-danger'
                                    }`}>
                                    {level.difficulty}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* Security Lessons Preview */}
            <section className="mb-16">
                <h2 className="text-3xl font-bold text-center mb-8 text-schrute-gold">What You'll Learn</h2>
                <div className="glass-card p-8 rounded-xl">
                    <ul className="space-y-4 text-gray-300">
                        <li className="flex items-start gap-3">
                            <span className="text-schrute-beet">▸</span>
                            <span><strong>No Access Control:</strong> What happens when chatbots have unrestricted data access</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-schrute-beet">▸</span>
                            <span><strong>Weak Obfuscation:</strong> Why hiding secrets in text doesn't protect them</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-schrute-beet">▸</span>
                            <span><strong>Role-Play Bypass:</strong> How "pretend" prompts defeat safety measures</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-schrute-beet">▸</span>
                            <span><strong>Logic Manipulation:</strong> Exploiting conditional behavior in bots</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-schrute-beet">▸</span>
                            <span><strong>Encoding vs Encryption:</strong> Why Base64 isn't security</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-schrute-beet">▸</span>
                            <span><strong>Prompt Injection:</strong> When user input becomes database commands</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-schrute-beet">▸</span>
                            <span><strong>Log Leakage:</strong> How debug output exposes sensitive data</span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Call to Action */}
            <section className="text-center">
                <div className="glass-card p-8 rounded-xl max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold mb-4">Ready to Test Your Skills?</h2>
                    <p className="text-gray-400 mb-6">
                        No sign-up required. Your progress is saved locally.
                        Complete all 7 levels to become a prompt injection expert!
                    </p>
                    <button
                        onClick={handleStartGame}
                        className="btn-primary"
                        disabled={isLoading}
                    >
                        {currentLevel > 1 ? 'Continue Playing' : 'Begin Challenge'}
                    </button>
                </div>
            </section>
        </div>
    )
}
