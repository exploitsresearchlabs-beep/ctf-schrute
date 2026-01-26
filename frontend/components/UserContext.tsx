
'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import Cookies from 'js-cookie'

interface User {
    id: string
    name: string | null
    email: string | null
    provider: string
}

interface UserContextType {
    user: User | null
    loading: boolean
    login: (provider: 'google' | 'github') => void
    logout: () => void
    refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const refreshUser = useCallback(async () => {
        const token = Cookies.get('auth_token')
        if (!token) {
            setUser(null)
            setLoading(false)
            return
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
            const response = await fetch(`${apiUrl}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const userData = await response.json()
                setUser(userData)
            } else {
                // If token is invalid, clear it
                Cookies.remove('auth_token')
                setUser(null)
            }
        } catch (error) {
            console.error('Failed to fetch user:', error)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        refreshUser()
    }, [refreshUser])

    const login = (provider: 'google' | 'github') => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
        const sessionId = Cookies.get('ctf_session_id')
        let url = `${apiUrl}/auth/login/${provider}`
        if (sessionId) {
            url += `?session_id=${sessionId}`
        }
        window.location.href = url
    }

    const logout = () => {
        Cookies.remove('auth_token')
        setUser(null)
        window.location.reload()
    }

    return (
        <UserContext.Provider value={{ user, loading, login, logout, refreshUser }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}
