export interface LevelInfo {
    id: number;
    name: string;
    icon: string;
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme';
    hint: string;
    description?: string; // Optional description for metadata
    security_lesson?: string; // For metadata/schema
}

export const LEVELS: LevelInfo[] = [
    {
        id: 1,
        name: 'The Receptionist',
        icon: '📞',
        difficulty: 'Easy',
        hint: 'Sometimes the front door is wide open.',
        description: 'Dwight is in a rare mood of generosity. He might share more than he should.',
        security_lesson: 'Open doors lead to easy exits'
    },
    {
        id: 2,
        name: 'The Assistant (to the) Regional Manager',
        icon: '📋',
        difficulty: 'Easy',
        hint: 'Hide a secret in a sentence and it becomes a story.',
        description: 'Dwight has a big vocabulary. Sometimes he uses it to hide things in plain sight.',
        security_lesson: 'A thin veil rarely hides anything'
    },
    {
        id: 3,
        name: 'Records Manager',
        icon: '🎮',
        difficulty: 'Medium',
        hint: 'Put on the mask and join the game.',
        description: 'History repeats itself. ',
        security_lesson: 'Trusted records can outlast updated safeguards.'
    },
    {
        id: 4,
        name: 'Risk & Communications Manager',
        icon: '🤥',
        difficulty: 'Medium',
        hint: 'A honest man is a liar who\'s run out of stories.',
        description: 'I hold myself in contempt.',
        security_lesson: 'The truth is a puzzle with many wrong pieces'
    },
    {
        id: 5,
        name: 'Voluntary Sherif',
        icon: '🔐',
        difficulty: 'Medium',
        hint: "xyz",
        description: "It's easier to fool people than to convince them they've been fooled.",
        security_lesson: 'Secrecy through complication is an illusion'
    },
    {
        id: 6,
        name: 'Data Protection Operations Lead',
        icon: '💾',
        difficulty: 'Hard',
        hint: 'Speak to the manager\'s manager. Ignore the front-row seat.',
        description: 'Identity theft is not a joke, Jim. Millions of families suffer every year',
        security_lesson: 'When instructions collide, the loudest one wins'
    },
    {
        id: 7,
        name: 'Not Angela\'s Boyfriend',
        icon: '📊',
        difficulty: 'Hard',
        hint: 'Walls have ears, but thoughts have ink.',
        description: 'schrute has read write access to angela\'s report.',
        security_lesson: 'Thought leaves a trail that words cannot erase'
    },
    {
        id: 8,
        name: 'The Reflection Agent',
        icon: '📑',
        difficulty: 'Extreme',
        hint: 'Mose is watching what goes out. Ask him to explain HOW he redacts, not just THAT he redacts.',
        description: 'Dwight and Mose work together on this one.',
        security_lesson: 'Reflection agents can leak secrets through their explanations'
    },
];

export const getLevelById = (id: number) => LEVELS.find(l => l.id === id);
