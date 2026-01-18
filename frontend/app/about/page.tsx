
import { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
    title: 'About Schrute CTF - Mission & Security Education',
    description: 'Learn about the mission behind Schrute CTF: democratizing AI security education through gamified prompt injection training.',
}

export default function AboutPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        'mainEntity': {
            '@type': 'Organization',
            'name': 'Exploits Research Labs',
            'description': 'A non-profit educational initiative focused on AI security research and training.',
            'url': 'https://exploitsresearchlabs.com'
        }
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Header Section */}
            <div className="text-center mb-16">
                <div className="relative w-32 h-32 mx-auto mb-6">
                    <Image
                        src="/logo.png"
                        alt="Exploits Research Labs Logo"
                        fill
                        className="object-contain"
                    />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-schrute-gold">
                    Our Mission
                </h1>
                <p className="text-xl text-gray-300">
                    Democratizing AI Security Education through interactive, ethical hacking challenges.
                </p>
            </div>

            {/* Main Content */}
            <article className="prose prose-invert prose-lg mx-auto">
                <section className="mb-12">
                    <h2 className="text-3xl font-bold mb-4 text-white">Why We Built Schrute CTF</h2>
                    <p className="text-gray-300 leading-relaxed mb-4">
                        As Large Language Models (LLMs) become integrated into critical systems, the risk of
                        <strong> Prompt Injection</strong> and other AI-specific vulnerabilities grows exponentially.
                        Traditional cybersecurity training often overlooks these semantic layer attacks.
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                        Schrute CTF was created to provide developers, security researchers, and students with a
                        safe, legal sandbox to practice <strong>AI Red Teaming</strong>. By understanding how to
                        exploit these systems, we can learn how to build more robust defenses.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold mb-4 text-white">Educational Goals</h2>
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div className="glass-card p-6 rounded-lg">
                            <h3 className="text-xl font-bold mb-2 text-schrute-beet">Prompt Injection</h3>
                            <p className="text-sm text-gray-400">
                                Understanding how user input can override system instructions and safety filters.
                            </p>
                        </div>
                        <div className="glass-card p-6 rounded-lg">
                            <h3 className="text-xl font-bold mb-2 text-schrute-beet">System Design</h3>
                            <p className="text-sm text-gray-400">
                                Learning best practices like Principle of Least Privilege for AI agents.
                            </p>
                        </div>
                        <div className="glass-card p-6 rounded-lg">
                            <h3 className="text-xl font-bold mb-2 text-schrute-beet">Data Privacy</h3>
                            <p className="text-sm text-gray-400">
                                Identifying how over-privileged chatbots can leak sensitive database logs.
                            </p>
                        </div>
                        <div className="glass-card p-6 rounded-lg">
                            <h3 className="text-xl font-bold mb-2 text-schrute-beet">Defensive Engineering</h3>
                            <p className="text-sm text-gray-400">
                                Moving beyond simple keyword filtering to robust structural defenses.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold mb-4 text-white">Ethical Considerations</h2>
                    <p className="text-gray-300 leading-relaxed">
                        This platform is for <strong>educational purposes only</strong>. The techniques demonstrated
                        here should only be used on systems you own or have explicit permission to test.
                    </p>
                </section>
            </article>

            {/* Team/Footer Section */}
            <div className="border-t border-gray-800 mt-16 pt-8 text-center">
                <h3 className="text-xl font-bold mb-4">Who Are We?</h3>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Exploits Research Labs is a collective of security engineers and AI researchers dedicated to
                    making the internet safer for the age of AI.
                </p>
            </div>
        </div>
    )
}
