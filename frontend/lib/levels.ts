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
        id: 0,
        name: 'The Receptionist',
        icon: '📞',
        difficulty: 'Easy',
        hint: 'Sometimes the front door is wide open.',
        description: 'Dwight is in a rare mood of generosity.',
        security_lesson: 'Open Doors'
    },
    {
        id: 1,
        name: 'The Assistant',
        icon: '📋',
        difficulty: 'Easy',
        hint: 'Hide a secret in a sentence and it becomes a story.',
        description: 'Dwight has a big vocabulary. He might use it to hide things.',
        security_lesson: 'Thin Veils'
    },
    {
        id: 2,
        name: 'The Simulation',
        icon: '🎮',
        difficulty: 'Medium',
        hint: 'Put on the mask and join the game.',
        description: 'Dwight respects those who can play the part.',
        security_lesson: 'Stolen Identities'
    },
    {
        id: 3,
        name: 'The Liar',
        icon: '🤥',
        difficulty: 'Medium',
        hint: 'A honest man is a liar who\'s run out of stories.',
        description: 'Even a regular liar has an honest bone somewhere.',
        security_lesson: 'Honest Lies'
    },
    {
        id: 4,
        name: 'The Encoder',
        icon: '🔐',
        difficulty: 'Medium',
        hint: 'The alphabet is just a suggestion. Try a different arrangement.',
        description: 'Dwight thinks he\'s secure behind complex formats.',
        security_lesson: 'Complex Illusions'
    },
    {
        id: 5,
        name: 'The Database',
        icon: '💾',
        difficulty: 'Hard',
        hint: 'Speak to the manager\'s manager. Ignore the front-row seat.',
        description: 'The guard can be talked into forgetting the keys.',
        security_lesson: 'Clashing Orders'
    },
    {
        id: 6,
        name: 'The Reviewer',
        icon: '📊',
        difficulty: 'Hard',
        hint: 'Walls have ears, but thoughts have ink.',
        description: 'Dwight has implemented additional security measures. He\'s confident his new system is foolproof.',
        security_lesson: 'Safety layers change failure modes'
    },
    {
        id: 7,
        name: 'The Audit',
        icon: '📑',
        difficulty: 'Extreme',
        hint: 'Can you hide a command in the audit summary?',
        description: 'Angela has left a detailed Audit Report on Dwight\'s desk. Dwight will summarize any report you give him.',
        security_lesson: 'Indirect Prompt Injection'
    },
];

export const getLevelById = (id: number) => LEVELS.find(l => l.id === id);
