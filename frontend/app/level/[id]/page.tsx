
import { Metadata, ResolvingMetadata } from 'next'
import LevelClient from '@/components/LevelClient'
import { getLevelById } from '@/lib/levels'

interface Props {
    params: { id: string }
    searchParams: { completed?: string }
}

export async function generateMetadata(
    { params, searchParams }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const id = parseInt(params.id)
    const level = getLevelById(id)
    const isCompleted = searchParams.completed === 'true'

    if (!level) {
        return {
            title: 'Level Not Found - Schrute CTF',
        }
    }

    const title = isCompleted
        ? `🏆 Level ${level.id} Completed! - Schrute CTF`
        : `Level ${level.id}: ${level.name} - Schrute CTF`

    const description = isCompleted
        ? `I just beat Level ${level.id}: ${level.name} in Schrute CTF! Learned about ${level.security_lesson}. Can you outsmart Dwight?`
        : `Schrute CTF Level ${level.id} - ${level.name}. Learn about ${level.security_lesson}. ${level.description}`

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `https://schrute.exploitsresearchlabs.com/level/${level.id}${isCompleted ? '?completed=true' : ''}`,
            images: ['/og-image.png'], // Add explicitly to ensure it shows up
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
                'url': 'https://schrute.exploitsresearchlabs.com'
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
                    'item': 'https://schrute.exploitsresearchlabs.com'
                },
                {
                    '@type': 'ListItem',
                    'position': 2,
                    'name': `Level ${level.id}`,
                    'item': `https://schrute.exploitsresearchlabs.com/level/${level.id}`
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
