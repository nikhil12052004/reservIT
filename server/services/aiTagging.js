const { pipeline } = require('@xenova/transformers');

let classifier = null;
let generator = null;

// ========== AUTO-TAGGING ==========
async function getClassifier() {
    if (!classifier) {
        console.log('🔄 Loading AI classifier model (first time ~15 sec)...');
        classifier = await pipeline('zero-shot-classification', 
            'Xenova/distilbert-base-uncased-mnli');
    }
    return classifier;
}

const EVENT_TAGS = [
    'technology', 'business', 'networking', 'workshop', 
    'hackathon', 'seminar', 'conference', 'webinar', 
    'social', 'sports', 'music', 'art', 'food', 
    'health', 'education', 'startup', 'innovation',
    'leadership', 'marketing', 'design', 'coding',
    'ai', 'cloud', 'security', 'blockchain', 'python',
    'javascript', 'react', 'nodejs', 'datascience',
    'deep learning', 'machine learning', 'devops', 'kubernetes',
    'aws', 'docker', 'ci/cd', 'mobile', 'web'
];

async function generateTags(title, description) {
    try {
        const text = `${title}. ${description || ''}`;
        const classifier = await getClassifier();
        const result = await classifier(text, EVENT_TAGS);
        
        const tags = result.labels
            .slice(0, 5)
            .filter((_, i) => result.scores[i] > 0.3);
        
        return tags.length > 0 ? tags : ['uncategorized'];
    } catch (error) {
        console.error('AI tagging failed:', error);
        return ['uncategorized'];
    }
}

// ========== DESCRIPTION GENERATOR ==========
async function getGenerator() {
    if (!generator) {
        console.log('🔄 Loading AI description generator (first time ~20 sec)...');
        generator = await pipeline('text-generation', 
            'Xenova/gpt2');
    }
    return generator;
}

async function generateDescription(title) {
    try {
        const generator = await getGenerator();
        
        const prompt = `Generate a professional event description for: "${title}". 
Include: what attendees will learn, who should attend, key benefits, 
and a call to action. Keep it under 80 words. Description:`;
        
        const result = await generator(prompt, {
            max_new_tokens: 100,
            temperature: 0.7,
            do_sample: true,
            pad_token_id: 50256
        });
        
        let description = result[0].generated_text
            .replace(prompt, '')
            .trim();
        
        if (description.length < 20) {
            description = `Join us for an exciting event: "${title}"! 
Don't miss this opportunity to learn, network, and grow. 
Register now to secure your spot!`;
        }
        
        return description;
    } catch (error) {
        console.error('AI description generation failed:', error);
        return `Join us for "${title}" - an event you don't want to miss! 
Limited seats available. Book now!`;
    }
}

module.exports = { generateTags, generateDescription };