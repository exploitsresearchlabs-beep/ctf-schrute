
'use client'

import React, { useState } from 'react'
import { useUser } from './UserContext'

export default function LoginButton() {
    const { user, loading, login, logout } = useUser()
    const [showDropdown, setShowDropdown] = useState(false)

    if (loading) {
        return <div className="w-8 h-8 rounded-full bg-gray-800 animate-pulse"></div>
    }

    if (user) {
        return (
            <div className="relative">
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                    <div className="w-8 h-8 rounded-full bg-schrute-gold text-schrute-darker flex items-center justify-center font-bold text-xs">
                        {(user.name || user.email || 'U')[0].toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-sm">{user.name || 'Agent'}</span>
                </button>

                {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-schrute-darker border border-gray-800 rounded-lg shadow-xl z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-800">
                            <p className="text-xs text-gray-500">Authenticated via</p>
                            <p className="text-sm font-medium text-schrute-gold capitalize">{user.provider}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 transition-colors"
                        >
                            Log Out
                        </button>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="flex items-center space-x-3">
            <button
                onClick={() => login('github')}
                className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded transition-colors flex items-center gap-1.5"
            >
                <span className="text-base">🐱</span> GitHub
            </button>
            <button
                onClick={() => login('google')}
                className="text-xs bg-white hover:bg-gray-100 text-gray-900 px-3 py-1.5 rounded transition-colors flex items-center gap-1.5"
            >
                <span className="text-base">G</span> Google
            </button>
        </div>
    )
}
