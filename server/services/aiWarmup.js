const { generateTags, generateDescription } = require('./aiTagging');
const { semanticSearch } = require('./aiSearch');

async function warmupAI() {
    console.log('🔥 Warming up AI models...');
    try {
        await generateTags('Warmup', 'Loading AI models for better performance');
        console.log('✅ Tagging model loaded');
        
        await generateDescription('AI Model Warmup');
        console.log('✅ Description generator loaded');
        
        await semanticSearch('warmup', []);
        console.log('✅ Search model loaded');
        
        console.log('🚀 All AI models warmed up successfully!');
    } catch (error) {
        console.error('⚠️ AI warmup failed:', error.message);
    }
}

module.exports = { warmupAI };