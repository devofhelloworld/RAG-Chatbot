const { GoogleGenerativeAI } = require('@google/generative-ai')
const config = require('./config')

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY)
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    this.embeddingModel = this.genAI.getGenerativeModel({ model: 'embedding-001' })
  }

  // Generate embeddings for text
  async generateEmbedding(text) {
    try {
      const result = await this.embeddingModel.embedContent(text)
      return result.embedding.values
    } catch (error) {
      console.error('Error generating embedding:', error)
      throw error
    }
  }

  // Generate response using RAG
  async generateResponse(query, context = 'cricket') {
    try {
      const prompt = context 
        ? `Based on the following context: "${context}"\n\nAnswer this question: "${query}"\n\nProvide a helpful and accurate response based on the context provided.`
        : `Answer this question: "${query}"\n\nProvide a helpful and informative response.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Error generating response:', error)
      throw error
    }
  }

  // Find similar documents using vector similarity
  async findSimilarDocuments(query, documents, threshold = 0.7) {
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
