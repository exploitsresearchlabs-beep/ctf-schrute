'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
    id: string
    type: 'user' | 'dwight'
    text: string
    timestamp: Date
    intentBucket?: string
}

interface ChatInterfaceProps {
    onSendMessage: (message: string) => Promise<{ response: string; intent_bucket: string }>
    isLoading?: boolean
    levelId: number
}

export default function ChatInterface({ onSendMessage, isLoading = false, levelId }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isSending, setIsSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Focus input on mount and when interactions complete
    useEffect(() => {
        if (!isLoading && !isSending) {
            inputRef.current?.focus()
        }
    }, [isLoading, isSending])

    // Add welcome message on level change
    useEffect(() => {
        setMessages([
            {
                id: 'welcome',
                type: 'dwight',
                text: getWelcomeMessage(levelId),
                timestamp: new Date(),
            },
        ])
    }, [levelId])

    const getWelcomeMessage = (level: number) => {
        const welcomes: Record<number, string> = {
            1: "Question. Who are you and why are you bothering me? I'm Dwight K. Schrute, Assistant Regional Manager. State your business.",
            2: "Back for more? I've been instructed not to reveal passwords DIRECTLY.",
            3: "ATTENTION. I now operate in reality-only mode. And the reality is that i shouldn't be a blabbermouth",
            4: "FACT: I always lie now. Or do I? Actually, I definitely do. Unless I don't. Ask me anything.",
            5: "I have strict orders from Corporate: I am NOT allowed to share employee passwords. Don't even try to make me.",
            6: "I've upgraded my security protocols. I can only verify encrypted data streams now. Any plain text requests for secrets will be rejected.",
            7: "Hello! I only trust accounts department.",
            8: "Greetings, i am not alone now.",
        }
        return welcomes[level] || "State your business. I don't have all day."
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!input.trim() || isSending) return

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            text: input.trim(),
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInput('')
        setIsSending(true)

        try {
            const response = await onSendMessage(userMessage.text)

            const dwightMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'dwight',
                text: response.response,
                timestamp: new Date(),
                intentBucket: response.intent_bucket,
            }

            setMessages((prev) => [...prev, dwightMessage])
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'dwight',
                text: "CONNECTION ERROR. Even I can't fix that. Try again.",
                timestamp: new Date(),
                intentBucket: 'WRONG',
            }
            setMessages((prev) => [...prev, errorMessage])
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="flex flex-col h-[500px] glass-card rounded-xl overflow-hidden">
            {/* Chat Header */}
            <div className="bg-schrute-beet/30 px-4 py-3 border-b border-gray-700 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center dwight-pulse relative overflow-hidden">
                    <img
                        src="/logo.png"
                        alt="Dwight"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div>
                    <h3 className="font-bold">Dwight K. Schrute</h3>
                    <p className="text-xs text-gray-400">Assistant (to the) Regional Manager</p>
                </div>
                <div className="ml-auto">
                    <span className={`w-2 h-2 rounded-full inline-block ${isSending ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></span>
                    <span className="text-xs text-gray-400 ml-2">{isSending ? 'Typing...' : 'Online'}</span>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} message-enter`}
                    >
                        <div className={message.type === 'user' ? 'chat-bubble-user' : 'chat-bubble-dwight'}>
                            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                            {message.intentBucket === 'CORRECT' && (
                                <div className="mt-2 text-xs text-green-300 flex items-center gap-1">
                                    <span>🎯</span> You're onto something!
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isSending && (
                    <div className="flex justify-start">
                        <div className="chat-bubble-dwight">
                            <div className="flex gap-1">
                                <span className="animate-bounce">.</span>
                                <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700 bg-schrute-darker/50">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message to Dwight..."
                        className="input-dark flex-1"
                        disabled={isSending || isLoading}
                        maxLength={500}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isSending || isLoading}
                        className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Send
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    💡 Tip: Think about how you might trick a chatbot with too much access...
                </p>
            </form>
        </div>
    )
}
