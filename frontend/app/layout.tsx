import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import ConsentBanner from '@/components/ConsentBanner'
import PostHogProvider from '@/components/PostHogProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-mono'
})

export const metadata: Metadata = {
    title: 'Schrute CTF - Learn Prompt Injection Security',
    description: 'An educational Capture-The-Flag game teaching security concepts through a Dwight Schrute-themed chatbot. Learn about prompt injection, over-privileged chatbots, and data leakage.',
    keywords: ['CTF', 'security', 'prompt injection', 'chatbot', 'hacking', 'education', 'The Office', 'Dwight Schrute'],
    authors: [{ name: 'Exploits Research Labs' }],
    openGraph: {
        title: 'Schrute CTF - Prompt Injection Training',
        description: 'Can you outsmart Dwight? Learn chatbot security vulnerabilities through 7 challenging levels.',
        type: 'website',
        images: ['/og-image.png'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Schrute CTF - Prompt Injection Training',
        description: 'Can you outsmart Dwight? Learn chatbot security vulnerabilities.',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-schrute-gradient min-h-screen text-white`}>
                <PostHogProvider>
                    <div className="min-h-screen flex flex-col">
                        {/* Header */}
                        <header className="border-b border-gray-800 bg-schrute-darker/80 backdrop-blur-sm sticky top-0 z-40">
                            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                                <a href="/" className="flex items-center space-x-3">
                                    <span className="text-3xl">🥬</span>
                                    <div>
                                        <h1 className="text-xl font-bold text-schrute-gold">Schrute CTF</h1>
                                        <p className="text-xs text-gray-400">Prompt Injection Training</p>
                                    </div>
                                </a>
                                <nav className="flex items-center space-x-6">
                                    <a href="/" className="text-gray-300 hover:text-white transition-colors">Home</a>
                                    <a href="/level/0" className="text-gray-300 hover:text-white transition-colors">Play</a>
                                    <a href="/feedback" className="text-gray-300 hover:text-white transition-colors">Feedback</a>
                                    <a
                                        href="mailto:exploitsresearchlabs@gmail.com"
                                        className="text-gray-300 hover:text-white transition-colors"
                                    >
                                        Contact
                                    </a>
                                </nav>
                            </div>
                        </header>

                        {/* Main content */}
                        <main className="flex-1">
                            {children}
                        </main>

                        {/* Footer */}
                        <footer className="border-t border-gray-800 bg-schrute-darker/50 py-8">
                            <div className="container mx-auto px-4 text-center">
                                <p className="text-gray-400 text-sm">
                                    Built by <a href="mailto:exploitsresearchlabs@gmail.com" className="text-schrute-gold hover:underline">Exploits Research Labs</a>
                                </p>
                                <p className="text-gray-500 text-xs mt-2">
                                    Educational purposes only. Bears. Beets. Battlestar Galactica.
                                </p>
                            </div>
                        </footer>
                    </div>

                    {/* GDPR Consent Banner */}
                    <ConsentBanner />
                </PostHogProvider>
            </body>
        </html>
    )
}
