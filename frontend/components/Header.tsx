'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import LoginButton from './LoginButton'

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <header className="border-b border-gray-800 bg-schrute-darker sticky top-0 z-[99]">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-3">
                    <div className="relative w-10 h-10">
                        <Image
                            src="/logo.png"
                            alt="Schrute CTF Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-schrute-gold m-0 leading-none">Schrute CTF</h1>
                        <p className="text-[10px] text-gray-400 m-0 uppercase tracking-wider">Prompt Injection Training</p>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-6">
                    <Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
                    <Link href="/about" className="text-gray-300 hover:text-white transition-colors">About</Link>
                    <Link href="/level/0" className="text-gray-300 hover:text-white transition-colors">Play</Link>
                    <Link href="/feedback" className="text-gray-300 hover:text-white transition-colors">Feedback</Link>
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

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-gray-400 hover:text-white"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Nav */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-gray-800 bg-schrute-darker py-4 animate-slide-up">
                    <nav className="flex flex-col space-y-4 px-4">
                        <Link
                            href="/"
                            className="text-gray-300 hover:text-white py-2 border-b border-gray-800/50"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            href="/about"
                            className="text-gray-300 hover:text-white py-2 border-b border-gray-800/50"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            About
                        </Link>
                        <Link
                            href="/level/0"
                            className="text-gray-300 hover:text-white py-2 border-b border-gray-800/50"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Play
                        </Link>
                        <Link
                            href="/feedback"
                            className="text-gray-300 hover:text-white py-2 border-b border-gray-800/50"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Feedback
                        </Link>
                        <a
                            href="mailto:exploitsresearchlabs@gmail.com"
                            className="text-gray-300 hover:text-white py-2 border-b border-gray-800/50"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Contact
                        </a>
                        <div className="pt-2">
                            <LoginButton />
                        </div>
                    </nav>
                </div>
            )}
        </header>
    )
}
