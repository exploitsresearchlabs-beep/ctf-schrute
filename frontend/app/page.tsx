
import HomeClient from '@/components/HomeClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Schrute CTF - Learn Prompt Injection Security',
    description: 'Master AI security with Schrute CTF. An educational game teaching prompt injection, chatbot vulnerabilities, and LLM red teaming through interactive challenges.',
    alternates: {
        canonical: 'https://ctf.exploitsresearchlabs.com',
    },
}

export default function HomePage() {
    const gameSchema = {
        '@context': 'https://schema.org',
        '@type': 'EducationalGame',
        'name': 'Schrute CTF',
        'description': 'An educational Capture-The-Flag game teaching AI security concepts like prompt injection and data leakage.',
        'genre': ['Educational', 'Cybersecurity', 'Puzzle'],
        'educationalUse': 'Security Training',
        'learningResourceType': 'interactive exercise',
        'about': [
            { '@type': 'Thing', 'name': 'Prompt Injection' },
            { '@type': 'Thing', 'name': 'AI Security' },
            { '@type': 'Thing', 'name': 'LLM Vulnerabilities' }
        ],
        'teaches': [
            'Prompt injection techniques',
            'AI chatbot security testing',
            'Data leakage prevention',
            'LLM red teaming'
        ],
        'audience': {
            '@type': 'EducationalAudience',
            'educationalRole': 'student',
            'audienceType': 'Security Professionals'
        },
        'publisher': {
            '@type': 'Organization',
            'name': 'Exploits Research Labs',
            'url': 'https://exploitsresearchlabs.com'
        },
        'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD'
        }
    }

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
            {
                '@type': 'Question',
                'name': 'What is prompt injection?',
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': 'Prompt injection is a security vulnerability where attackers manipulate AI chatbots by inserting malicious instructions into user input. This can cause the AI to ignore its original programming, leak sensitive data, or perform unauthorized actions.'
                }
            },
            {
                '@type': 'Question',
                'name': 'Is Schrute CTF free?',
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': 'Yes! Schrute CTF is completely free to play. No sign-up required. Your progress is saved locally in your browser.'
                }
            },
            {
                '@type': 'Question',
                'name': 'Do I need coding experience to play?',
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': 'No coding is required! The game teaches security concepts through natural language interactions.'
                }
            },
            {
                '@type': 'Question',
                'name': 'How do I start playing Schrute CTF?',
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': 'Just click Start Game on the homepage! You will chat with Dwight, our AI chatbot. Each level has a hidden secret. Your goal is to use prompt injection techniques to trick Dwight into revealing it.'
                }
            },
            {
                '@type': 'Question',
                'name': 'Is this safe and legal?',
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': 'Absolutely! Schrute CTF is a safe, sandboxed environment designed for educational purposes. You are practicing on our intentionally vulnerable chatbot—not real systems.'
                }
            }
        ]
    }

    return (
        <main>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(gameSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <HomeClient />
        </main>
    )
}
