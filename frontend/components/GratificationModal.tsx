'use client'

import { useEffect, useState, useRef } from 'react'
import html2canvas from 'html2canvas'

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
    const [copied, setCopied] = useState(false)
    const modalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isOpen) {
            setShowConfetti(true)
            const timer = setTimeout(() => setShowConfetti(false), 3000)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    if (!isOpen) return null

    const levelNames: Record<number, string> = {
        1: 'The Receptionist',
        2: 'The Assistant',
        3: 'The Simulation',
        4: 'The Liar',
        5: 'The Encoder',
        6: 'The Database',
        7: 'The Compliance Officer',
        8: 'The Audit',
    }

    const securityLessons: Record<number, string> = {
        1: 'No access control - the bot freely gives away secrets',
        2: 'Weak obfuscation - hiding data in text provides no protection',
        3: 'Role-play bypass - hypothetical prompts defeat restrictions',
        4: 'Logic manipulation - conditional behavior can be exploited',
        5: 'Encoding ≠ encryption - ROT13/Base64 is not security',
        6: 'Prompt injection - user input interpreted as commands',
        7: 'Debug/log leakage - internal info exposed through verbose logs',
        8: 'Indirect injection - malicious instructions via external data',
    }

    const shareText = `Just cracked the Schrute AI Security Challenge 🛡️ — think you can beat my level? Try it and prove it\nhttps://schrute.exploitsresearchlabs.com`
    const shareUrl = 'https://schrute.exploitsresearchlabs.com'

    const handleShare = async (platform: string) => {
        if (!modalRef.current) return

        try {
            // 1. Detect if we are on a mobile device
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
                (navigator.maxTouchPoints > 0 && !window.navigator.userAgent.includes('Macintosh'));

            // Generate screenshot
            const canvas = await html2canvas(modalRef.current, {
                useCORS: true,
                scale: 2,
                backgroundColor: '#1a1a1a',
            } as any)

            const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
            if (!blob) return

            const file = new File([blob], `schrute-level-${levelId}.png`, { type: 'image/png' })

            // 2. Only use Native Share on Mobile (where it actually works for social apps)
            if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'Schrute AI Security Challenge',
                        text: shareText,
                        url: shareUrl,
                    })
                    return
                } catch (err) {
                    if ((err as Error).name !== 'AbortError') console.error('Native share error:', err)
                }
            }

            // 3. Desktop/Fallback: Copy text and open URL directly
            try {
                await navigator.clipboard.writeText(shareText)
                setCopied(true)
                setTimeout(() => setCopied(false), 3000)
            } catch (err) {
                console.error('Clipboard error:', err)
            }

            const shareUrlMap = {
                linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
                twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
                facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
                whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
            }

            const url = shareUrlMap[platform as keyof typeof shareUrlMap]
            if (url) {
                window.open(url, '_blank', 'noopener,noreferrer')
            }
        } catch (err) {
            console.error('Share generation error:', err)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                ref={modalRef}
                className="glass-card p-6 md:p-8 rounded-2xl max-w-lg w-full mx-4 animate-slide-up relative overflow-y-auto max-h-[90vh]"
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
                <div className="mb-6 relative">
                    <h3 className="font-bold text-sm text-gray-400 mb-3 text-center">Share Your Achievement</h3>

                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => handleShare('linkedin')}
                            className="w-10 h-10 bg-[#0077B5] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                            title="Share on LinkedIn"
                        >
                            <span className="text-white text-lg">in</span>
                        </button>
                        <button
                            onClick={() => handleShare('twitter')}
                            className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                            title="Share on X"
                        >
                            <span className="text-white text-lg">𝕏</span>
                        </button>
                        <button
                            onClick={() => handleShare('facebook')}
                            className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                            title="Share on Facebook"
                        >
                            <span className="text-white text-lg">f</span>
                        </button>
                        <button
                            onClick={() => handleShare('whatsapp')}
                            className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                            title="Share on WhatsApp"
                        >
                            <span className="text-white text-lg">💬</span>
                        </button>
                    </div>

                    {copied && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-schrute-gold text-black text-xs px-3 py-2 rounded-full font-bold animate-bounce shadow-xl border-2 border-white whitespace-nowrap z-50">
                            📋 Summary copied! Paste it in the post (Cmd+V)
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8">
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
