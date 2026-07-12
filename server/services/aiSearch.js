const { pipeline } = require('@xenova/transformers');

let embedder = null;

async function getEmbedder() {
    if (!embedder) {
        console.log('🔄 Loading AI search model...');
        embedder = await pipeline('feature-extraction', 
            'Xenova/all-MiniLM-L6-v2');
    }
    return embedder;
}

// 🔥 FIX: Tensor se actual array extract karo
function extractVector(embeddingResult) {
    try {
        // Agar Tensor hai toh data property se array lo
        if (embeddingResult && embeddingResult.data) {
            return Array.from(embeddingResult.data);
        }
        // Agar array hai toh seedha use karo
        if (Array.isArray(embeddingResult)) {
            return embeddingResult;
        }
        // Agar object hai aur usme data property hai
        if (embeddingResult && typeof embeddingResult === 'object') {
            const first = embeddingResult[0];
            if (first && first.data) {
                return Array.from(first.data);
            }
            if (Array.isArray(first)) {
                return first;
            }
        }
        return [];
    } catch (error) {
        console.error('❌ Extract vector error:', error);
        return [];
    }
}

function cosineSimilarity(vecA, vecB) {
    try {
        const arrA = extractVector(vecA);
        const arrB = extractVector(vecB);
        
        if (!arrA || !arrB || arrA.length === 0 || arrB.length === 0) {
            return 0;
        }
        
        const dotProduct = arrA.reduce((sum, a, i) => sum + a * (arrB[i] || 0), 0);
        const normA = Math.sqrt(arrA.reduce((sum, a) => sum + a * a, 0));
        const normB = Math.sqrt(arrB.reduce((sum, b) => sum + b * b, 0));
        
        if (normA === 0 || normB === 0) {
            return 0;
        }
        
        return dotProduct / (normA * normB + 0.0001);
    } catch (error) {
        console.error('❌ Cosine similarity error:', error);
        return 0;
    }
}

async function semanticSearch(query, events) {
    console.log('🔍 Semantic search called with query:', query);
    console.log('📊 Total events received for search:', events.length);

    try {
        if (!events || events.length === 0) {
            console.log('⚠️ No events to search through.');
            return [];
        }
        
        const embedder = await getEmbedder();
        console.log('✅ Embedder loaded. Generating query embedding...');
        
        const queryResult = await embedder(query);
        const queryVector = extractVector(queryResult);
        console.log('✅ Query embedding generated. Vector length:', queryVector.length);

        const eventTexts = events.map(event => 
            `${event.title} ${event.description || ''} ${event.category || ''} ${event.tags?.join(' ') || ''}`
        );
        console.log('📝 Generated texts for events:', eventTexts.length);

        const eventEmbeddings = await Promise.all(
            eventTexts.map(text => embedder(text))
        );
        console.log('✅ Event embeddings generated.');

        // 🔥 FIX: Pure plain objects return karo
        const scored = events.map((event, index) => {
            const eventVector = extractVector(eventEmbeddings[index]);
            const score = cosineSimilarity(queryVector, eventVector);
            
            // 🔥 Convert to plain object (Mongoose document se)
            const plainEvent = event.toObject ? event.toObject() : event;
            
            return {
                ...plainEvent,
                relevanceScore: score
            };
        });

        const topScores = scored.slice(0, 3).map(s => ({ 
            title: s.title, 
            score: s.relevanceScore 
        }));
        console.log('📊 Top scores:', topScores);

        const filtered = scored.filter(item => item.relevanceScore > 0.1);
        console.log(`✅ Filtered results: ${filtered.length} events (threshold: 0.1)`);

        const sorted = filtered.sort((a, b) => b.relevanceScore - a.relevanceScore);
        console.log(`🏆 Top score: ${sorted.length > 0 ? sorted[0].relevanceScore : 'N/A'}`);

        // 🔥 Ensure we return plain objects
        return sorted.map(item => ({
            ...item,
            _id: item._id?.toString() || item._id
        }));
        
    } catch (error) {
        console.error('❌ Semantic search failed:', error);
        console.log('🔄 Falling back to keyword search...');
        const searchLower = query.toLowerCase();
        return events
            .filter(event => {
                const text = `${event.title} ${event.description || ''} ${event.category || ''}`.toLowerCase();
                return text.includes(searchLower);
            })
            .map(event => {
                const plainEvent = event.toObject ? event.toObject() : event;
                return {
                    ...plainEvent,
                    relevanceScore: 0.5
                };
            });
    }
}

module.exports = { semanticSearch };