import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/private/', '/api/'], // Disallow API routes from crawling
        },
        sitemap: 'https://ctf.exploitsresearchlabs.com/sitemap.xml',
    }
}
