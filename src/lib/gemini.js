const { GoogleGenerativeAI } = require('@google/generative-ai')
const config = require('./config')

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY)
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    this.embeddingModel = this.genAI.getGenerativeModel({ model: 'embedding-001' })
    
    // Rate limiting storage
    this.userMessageCounts = new Map()
    this.MESSAGE_LIMIT = 4
    this.RESET_INTERVAL = 60 * 60 * 1000 // 1 hour in milliseconds

    // Cricket-related keywords and patterns
    this.cricketKeywords = [
      'cricket', 'bat', 'ball', 'wicket', 'run', 'over', 'innings', 'bowler',
      'batsman', 'batter', 'fielder', 'umpire', 'test match', 'odi', 't20',
      'ipl', 'world cup', 'stadium', 'pitch', 'boundary', 'six', 'four',
      'lbw', 'catch', 'stump', 'bail', 'crease', 'spinner', 'fast bowler',
      'all-rounder', 'captain', 'team', 'series', 'tournament', 'player',
      'score', 'century', 'half-century', 'maiden', 'no-ball', 'wide',
      'bcci', 'icc', 'match', 'game', 'sport'
    ]
  }

  // Check if user has exceeded rate limit
  checkRateLimit(userId) {
    const now = Date.now()
    const userData = this.userMessageCounts.get(userId)

    if (!userData) {
      this.userMessageCounts.set(userId, {
        count: 1,
        resetTime: now + this.RESET_INTERVAL
      })
      return { allowed: true, remaining: this.MESSAGE_LIMIT - 1 }
    }

    if (now >= userData.resetTime) {
      this.userMessageCounts.set(userId, {
        count: 1,
        resetTime: now + this.RESET_INTERVAL
      })
      return { allowed: true, remaining: this.MESSAGE_LIMIT - 1 }
    }

    if (userData.count >= this.MESSAGE_LIMIT) {
      const timeUntilReset = Math.ceil((userData.resetTime - now) / 1000 / 60)
      return {
        allowed: false,
        remaining: 0,
        resetIn: timeUntilReset,
        message: `Rate limit exceeded. You can send ${this.MESSAGE_LIMIT} messages per hour. Try again in ${timeUntilReset} minutes.`
      }
    }

    userData.count++
    this.userMessageCounts.set(userId, userData)
    
    return {
      allowed: true,
      remaining: this.MESSAGE_LIMIT - userData.count
    }
  }

  // Basic keyword check for cricket-related content
  isCricketRelatedBasic(text) {
    const lowerText = text.toLowerCase()
    return this.cricketKeywords.some(keyword => lowerText.includes(keyword))
  }

  // Advanced AI-based validation for cricket-related queries
  async isCricketRelatedAI(query) {
    try {
      const validationPrompt = `You are a classifier that determines if a question is related to cricket (the sport).

Question: "${query}"

Respond with ONLY "YES" if the question is about cricket (players, matches, rules, history, statistics, teams, tournaments, equipment, etc.) or "NO" if it's about something else.

Response:`

      const result = await this.model.generateContent(validationPrompt)
      const response = await result.response
      const answer = response.text().trim().toUpperCase()
      
      return answer.includes('YES')
    } catch (error) {
      console.error('Error validating cricket query:', error)
      // Fallback to keyword-based check if AI validation fails
      return this.isCricketRelatedBasic(query)
    }
  }

  // Validate if query is cricket-related
  async validateCricketQuery(query) {
    // First do a quick keyword check
    const basicCheck = this.isCricketRelatedBasic(query)
    
    if (basicCheck) {
      return { valid: true }
    }

    // If keyword check fails, use AI validation for more nuanced queries
    const aiCheck = await this.isCricketRelatedAI(query)
    
    if (!aiCheck) {
      return {
        valid: false,
        message: 'Sorry, I can only answer questions related to cricket. Please ask about cricket players, matches, rules, statistics, or anything related to the sport of cricket.'
      }
    }

    return { valid: true }
  }

  // Generate embeddings for text
  async generateEmbedding(text, userId = null) {
    if (userId) {
      const rateLimit = this.checkRateLimit(userId)
      if (!rateLimit.allowed) {
        throw new Error(rateLimit.message)
      }
    }

    try {
      const result = await this.embeddingModel.embedContent(text)
      return result.embedding.values
    } catch (error) {
      console.error('Error generating embedding:', error)
      throw error
    }
  }

  // Generate response using RAG
  async generateResponse(query, context = '', userId = null) {
    // Validate cricket-related query first
    const validation = await this.validateCricketQuery(query)
    if (!validation.valid) {
      throw new Error(validation.message)
    }

    if (userId) {
      const rateLimit = this.checkRateLimit(userId)
      if (!rateLimit.allowed) {
        throw new Error(rateLimit.message)
      }
    }

    try {
      const prompt = context 
        ? `You are a cricket expert assistant. Based on the following cricket context: "${context}"

Question: "${query}"

Provide a helpful and accurate response about cricket. Stay focused on cricket-related information only.`
        : `You are a cricket expert assistant. Answer this cricket question: "${query}"

Provide a helpful and informative response about cricket. Stay focused on cricket-related information only.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Error generating response:', error)
      throw error
    }
  }

  // Find similar documents using vector similarity
  async findSimilarDocuments(query, documents, threshold = 0.7, userId = null) {
    // Validate cricket-related query first
    const validation = await this.validateCricketQuery(query)
    if (!validation.valid) {
      throw new Error(validation.message)
    }

    if (userId) {
      const rateLimit = this.checkRateLimit(userId)
      if (!rateLimit.allowed) {
        throw new Error(rateLimit.message)
      }
    }

    try {
      const queryEmbedding = await this.generateEmbedding(query)
      const similarities = []

      for (const doc of documents) {
        if (doc.embedding) {
          const similarity = this.cosineSimilarity(queryEmbedding, doc.embedding)
          if (similarity >= threshold) {
            similarities.push({ ...doc, similarity })
          }
        }
      }

      return similarities.sort((a, b) => b.similarity - a.similarity)
    } catch (error) {
      console.error('Error finding similar documents:', error)
      throw error
    }
  }

  // Calculate cosine similarity between two vectors
  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length')
    }

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i]
      normA += vecA[i] * vecA[i]
      normB += vecB[i] * vecB[i]
    }

    normA = Math.sqrt(normA)
    normB = Math.sqrt(normB)

    if (normA === 0 || normB === 0) {
      return 0
    }

    return dotProduct / (normA * normB)
  }

  
}

module.exports = new GeminiService()