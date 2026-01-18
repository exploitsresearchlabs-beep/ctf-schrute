
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
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'EducationalGame',
        'name': 'Schrute CTF',
        'description': 'An educational Capture-The-Flag game teaching AI security concepts like prompt injection and data leakage.',
        'genre': ['Educational', 'Cybersecurity', 'Puzzle'],
        'educationalUse': 'Security Training',
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

    return (
        <main>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <HomeClient />
        </main>
    )
}
