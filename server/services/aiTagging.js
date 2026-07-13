const { pipeline } = require('@xenova/transformers');

let classifier = null;
let generator = null;

// ========== AUTO-TAGGING ==========
async function getClassifier() {
    if (!classifier) {
        console.log('🔄 Loading AI classifier model...');
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
    'javascript', 'react', 'nodejs', 'datascience'
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

// ========== DESCRIPTION GENERATOR (FLAN-T5) ==========
async function getGenerator() {
    if (!generator) {
        console.log('🔄 Loading FLAN-T5 model (better quality)...');
        generator = await pipeline('text2text-generation', 
            'Xenova/flan-t5-small');  // 🔥 Small = faster, decent quality
    }
    return generator;
}

async function generateDescription(title) {
    // 🔥 Category-based templates (bypass AI)
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('food') || titleLower.includes('khao') || titleLower.includes('restaurant') || titleLower.includes('cuisine')) {
        return `🍽️ Get ready for an unforgettable culinary experience at "${title}"! Enjoy delicious food, live music, and a vibrant atmosphere. Perfect for food lovers and families. Don't miss this flavorful event!`;
    }
    
    if (titleLower.includes('music') || titleLower.includes('sufi') || titleLower.includes('concert') || titleLower.includes('festival')) {
        return `🎵 Experience the magic of music at "${title}"! Join us for an evening of soulful melodies, energetic performances, and unforgettable vibes. Book your tickets now!`;
    }
    
    if (titleLower.includes('tech') || titleLower.includes('hackathon') || titleLower.includes('ai') || titleLower.includes('coding')) {
        return `💻 Join us for "${title}" - a technology event designed to inspire, educate, and connect. Learn from industry experts, network with peers, and discover the latest innovations.`;
    }
    
    if (titleLower.includes('business') || titleLower.includes('startup') || titleLower.includes('entrepreneur') || titleLower.includes('investor')) {
        return `📈 Elevate your business at "${title}"! Connect with entrepreneurs, investors, and industry leaders. Gain valuable insights and take your business to the next level.`;
    }
    
    // Default fallback
    return `🎉 Join us for "${title}" - an exciting event designed to inspire, educate, and connect. Limited seats available - register today!`;
}

module.exports = { generateTags, generateDescription };