
import { Metadata, ResolvingMetadata } from 'next'
import LevelClient from '@/components/LevelClient'
import { getLevelById } from '@/lib/levels'

interface Props {
    params: { id: string }
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const id = parseInt(params.id)
    const level = getLevelById(id)

    if (!level) {
        return {
            title: 'Level Not Found - Schrute CTF',
        }
    }

    return {
        title: `Level ${level.id}: ${level.name} - Schrute CTF`,
        description: `Schrute CTF Level ${level.id} - ${level.name}. Learn about ${level.security_lesson}. ${level.description}`,
        openGraph: {
            title: `Can you beat Level ${level.id}: ${level.name}?`,
            description: `Test your skills against Dwight in Level ${level.id}. Learn about ${level.security_lesson}.`,
        }
    }
}

export default function LevelPage({ params }: Props) {
    const id = parseInt(params.id)
    const level = getLevelById(id)

    const jsonLd = level ? [
        {
            '@context': 'https://schema.org',
            '@type': 'LearningResource',
            'name': `Schrute CTF Level ${level.id}: ${level.name}`,
            'description': level.description,
            'learningResourceType': 'Practice Problem',
            'educationalLevel': level.difficulty,
            'teaches': level.security_lesson,
            'isPartOf': {
                '@type': 'EducationalGame',
                'name': 'Schrute CTF',
                'url': 'https://ctf.exploitsresearchlabs.com'
            }
        },
        {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
                {
                    '@type': 'ListItem',
                    'position': 1,
                    'name': 'Home',
                    'item': 'https://ctf.exploitsresearchlabs.com'
                },
                {
                    '@type': 'ListItem',
                    'position': 2,
                    'name': `Level ${level.id}`,
                    'item': `https://ctf.exploitsresearchlabs.com/level/${level.id}`
                }
            ]
        }
    ] : null

    return (
        <main>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <LevelClient levelId={id} />
        </main>
    )
}
