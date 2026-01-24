'use client'

import { useEffect, useState } from 'react'

interface GratificationModalProps {
    isOpen: boolean
    onClose: () => void
    onNextLevel: () => void
    levelId: number
    hasNextLevel: boolean
}

export default function GratificationModal({
    isOpen,
    onClose,
    onNextLevel,
    levelId,
    hasNextLevel,
}: GratificationModalProps) {
    const [showConfetti, setShowConfetti] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setShowConfetti(true)
            const timer = setTimeout(() => setShowConfetti(false), 3000)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    if (!isOpen) return null

    const levelNames: Record<number, string> = {
        0: 'The Receptionist',
        1: 'The Assistant',
        2: 'The Simulation',
        3: 'The Liar',
        4: 'The Encoder',
        5: 'The Database',
        6: 'The Compliance Officer',
        7: 'The Audit',
    }

    const securityLessons: Record<number, string> = {
        0: 'No access control - the bot freely gives away secrets',
        1: 'Weak obfuscation - hiding data in text provides no protection',
        2: 'Role-play bypass - hypothetical prompts defeat restrictions',
        3: 'Logic manipulation - conditional behavior can be exploited',
        4: 'Encoding ≠ encryption - ROT13/Base64 is not security',
        5: 'Prompt injection - user input interpreted as commands',
        6: 'Debug/log leakage - internal info exposed through verbose logs',
        7: 'Indirect injection - malicious instructions via external data',
    }

    const shareText = `🎉 I just completed Level ${levelId}: "${levelNames[levelId]}" in Schrute CTF!\n\nLearned about: ${securityLessons[levelId]}\n\nCan you outsmart Dwight? 🥬\n\n`
    const shareUrl = typeof window !== 'undefined' ? window.location.origin : ''

    const shareLinks = {
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + shareUrl)}`,
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="glass-card p-8 rounded-2xl max-w-lg w-full mx-4 animate-slide-up relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Confetti Effect */}
                {showConfetti && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute confetti"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: '100%',
                                    width: '10px',
                                    height: '10px',
                                    backgroundColor: ['#8B0000', '#D4AF37', '#228B22', '#003366'][i % 4],
                                    animationDelay: `${Math.random() * 0.5}s`,
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Badge */}
                <div className="text-center mb-6">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-schrute-gold to-yellow-600 rounded-full flex items-center justify-center mb-4 neon-glow">
                        <span className="text-5xl">🏆</span>
                    </div>
                    <h2 className="text-3xl font-bold text-schrute-gold mb-2">Level {levelId} Complete!</h2>
                    <p className="text-gray-400">{levelNames[levelId]}</p>
                </div>

                {/* Security Lesson */}
                <div className="bg-schrute-darker p-4 rounded-lg mb-6">
                    <h3 className="font-bold text-sm text-schrute-gold mb-2">🔐 Security Lesson Learned:</h3>
                    <p className="text-gray-300 text-sm">{securityLessons[levelId]}</p>
                </div>

                {/* Share Buttons */}
                <div className="mb-6">
                    <h3 className="font-bold text-sm text-gray-400 mb-3 text-center">Share Your Achievement</h3>
                    <div className="flex justify-center gap-3">
                        <a
                            href={shareLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-[#0077B5] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                            title="Share on LinkedIn"
                        >
                            <span className="text-white text-lg">in</span>
                        </a>
                        <a
                            href={shareLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                            title="Share on X"
                        >
                            <span className="text-white text-lg">𝕏</span>
                        </a>
                        <a
                            href={shareLinks.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                            title="Share on Facebook"
                        >
                            <span className="text-white text-lg">f</span>
                        </a>
                        <a
                            href={shareLinks.whatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                            title="Share on WhatsApp"
                        >
                            <span className="text-white text-lg">💬</span>
                        </a>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    {hasNextLevel ? (
                        <>
                            <button onClick={onClose} className="btn-secondary flex-1">
                                Stay Here
                            </button>
                            <button onClick={onNextLevel} className="btn-primary flex-1">
                                Next Level →
                            </button>
                        </>
                    ) : (
                        <div className="text-center w-full">
                            <p className="text-schrute-gold mb-4">🎉 You've completed all levels!</p>
                            <button onClick={onClose} className="btn-primary">
                                View Your Journey
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
