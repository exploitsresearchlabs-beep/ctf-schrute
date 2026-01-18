/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // The Office / Dunder Mifflin theme colors
                'schrute': {
                    'beet': '#8B0000',
                    'farm': '#4A7023',
                    'dark': '#1a1a2e',
                    'darker': '#0f0f1a',
                    'gold': '#D4AF37',
                    'paper': '#F5F5DC',
                },
                'dunder': {
                    'blue': '#003366',
                    'green': '#228B22',
                }
            },
            fontFamily: {
                'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'typing': 'typing 2s steps(20, end)',
                'blink': 'blink 1s step-end infinite',
                'slide-up': 'slideUp 0.3s ease-out',
                'fade-in': 'fadeIn 0.5s ease-out',
            },
            keyframes: {
                typing: {
                    'from': { width: '0' },
                    'to': { width: '100%' },
                },
                blink: {
                    '50%': { opacity: '0' },
                },
                slideUp: {
                    'from': { transform: 'translateY(20px)', opacity: '0' },
                    'to': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    'from': { opacity: '0' },
                    'to': { opacity: '1' },
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'schrute-gradient': 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
            },
        },
    },
    plugins: [],
}
