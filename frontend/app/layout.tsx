import type { Metadata } from 'next'
import Image from 'next/image'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import ConsentBanner from '@/components/ConsentBanner'
import PostHogProvider from '@/components/PostHogProvider'
import { UserProvider } from '@/components/UserContext'
import LoginButton from '@/components/LoginButton'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-mono'
})

export const metadata: Metadata = {
    metadataBase: new URL('https://ctf.exploitsresearchlabs.com'),
    title: {
        template: '%s | Schrute CTF',
        default: 'Schrute CTF - Learn Prompt Injection Security',
    },
    description: 'An educational Capture-The-Flag game teaching security concepts through a Dwight Schrute-themed chatbot. Learn about prompt injection, over-privileged chatbots, and data leakage.',
    keywords: ['CTF', 'security', 'prompt injection', 'chatbot', 'hacking', 'education', 'The Office', 'Dwight Schrute', 'LLM Security', 'AI Red Teaming'],
    authors: [{ name: 'Exploits Research Labs', url: 'https://exploitsresearchlabs.com' }],
    creator: 'Exploits Research Labs',
    publisher: 'Exploits Research Labs',
    openGraph: {
        title: 'Schrute CTF - Prompt Injection Training',
        description: 'Can you outsmart Dwight? Learn chatbot security vulnerabilities through 7 challenging levels.',
        url: 'https://ctf.exploitsresearchlabs.com',
        siteName: 'Schrute CTF',
        type: 'website',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Schrute CTF Preview',
            },
        ],
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Schrute CTF - Prompt Injection Training',
        description: 'Can you outsmart Dwight? Learn chatbot security vulnerabilities.',
        creator: '@exploitslabs', // Placeholder handle
        images: ['/og-image.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'Exploits Research Labs',
        'url': 'https://exploitsresearchlabs.com',
        'logo': 'https://ctf.exploitsresearchlabs.com/logo.png',
        'sameAs': [
            'https://github.com/exploits-research-labs', // Placeholder
            'https://twitter.com/exploitslabs' // Placeholder
        ],
        'contactPoint': {
            '@type': 'ContactPoint',
            'email': 'exploitsresearchlabs@gmail.com',
            'contactType': 'customer support'
        }
    }

    return (
        <html lang="en" className="dark">
            <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-schrute-gradient min-h-screen text-white`}>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <PostHogProvider>
                    <UserProvider>
                        <div className="min-h-screen flex flex-col">
                            {/* Header */}
                            <header className="border-b border-gray-800 bg-schrute-darker sticky top-0 z-[99]">
                                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                                    <a href="/" className="flex items-center space-x-3">
                                        <div className="relative w-10 h-10">
                                            <Image
                                                src="/logo.png"
                                                alt="Schrute CTF Logo"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                        <div>
                                            <h1 className="text-xl font-bold text-schrute-gold">Schrute CTF</h1>
                                            <p className="text-xs text-gray-400">Prompt Injection Training</p>
                                        </div>
                                    </a>
                                    <nav className="flex items-center space-x-6">
                                        <a href="/" className="text-gray-300 hover:text-white transition-colors">Home</a>
                                        <a href="/about" className="text-gray-300 hover:text-white transition-colors">About</a>
                                        <a href="/level/0" className="text-gray-300 hover:text-white transition-colors">Play</a>
                                        <a href="/feedback" className="text-gray-300 hover:text-white transition-colors">Feedback</a>
                                        <a
                                            href="mailto:exploitsresearchlabs@gmail.com"
                                            className="text-gray-300 hover:text-white transition-colors"
                                        >
                                            Contact
                                        </a>
                                        <div className="pl-4 border-l border-gray-800">
                                            <LoginButton />
                                        </div>
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
                    </UserProvider>
                </PostHogProvider>
            </body>
        </html>
    )
}
