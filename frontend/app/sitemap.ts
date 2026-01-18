import { MetadataRoute } from 'next'
import { LEVELS } from '@/lib/levels'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://ctf.exploitsresearchlabs.com'

    const levelUrls = LEVELS.map((level) => ({
        url: `${baseUrl}/level/${level.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        ...levelUrls,
    ]
}
