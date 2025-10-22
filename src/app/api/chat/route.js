import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import geminiService from '@/lib/gemini'
import config from '@/lib/config'
import { ObjectId } from 'mongodb'

export async function POST(request) {
  try {
    // Extract and verify token
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const db = await getDatabase()
    const usersCollection = db.collection('users')
    const chatsCollection = db.collection('chats')

    // Get user and check rate limit
    const user = await usersCollection.findOne({ _id: new ObjectId(decoded.userId) })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Rate limiting check
    const now = new Date()
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour in milliseconds
    const rateLimitReset = user.rateLimitReset ? new Date(user.rateLimitReset) : null
    
    if (!rateLimitReset || now > rateLimitReset) {
      // Reset rate limit
      await usersCollection.updateOne(
        { _id: user._id },
        { 
          $set: { 
            rateLimitCount: 1, // Set to 1 for current request
            rateLimitReset: oneHourFromNow
          }
        }
      )
    } else if (user.rateLimitCount >= config.RATE_LIMIT_MAX_REQUESTS) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          resetTime: rateLimitReset
        },
        { status: 429 }
      )
    } else {
      // Increment rate limit counter and update reset time
      await usersCollection.updateOne(
        { _id: user._id },
        { 
          $inc: { rateLimitCount: 1 },
          $set: { rateLimitReset: oneHourFromNow }
        }
      )
    }

    // Get chat message
    const { message, chatId } = await request.json()
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Find similar documents for RAG
    const documentsCollection = db.collection('documents')
    const documents = await documentsCollection.find({}).toArray()
    
    let context = ''
    if (documents.length > 0) {
      const similarDocs = await geminiService.findSimilarDocuments(message, documents)
      context = similarDocs.slice(0, 3).map(doc => doc.content).join(' ')
    }

    // Generate response using Gemini (or fallback)
    let response
    try {
      response = await geminiService.generateResponse(message, context)
    } catch (error) {
      console.log('Gemini API not available, using fallback response')
      response = `Sorry, I can only answer questions related to cricket. Please ask about cricket players, matches, rules, statistics, or anything related to the sport of cricket.`
    }

    // Save chat to database
    const chatMessage = {
      userId: user._id,
      message,
      response,
      context: context.substring(0, 500), // Store first 500 chars of context
      timestamp: new Date(),
      chatId: chatId || new Date().getTime().toString()
    }

    await chatsCollection.insertOne(chatMessage)

    return NextResponse.json({
      response,
      chatId: chatMessage.chatId,
      timestamp: chatMessage.timestamp
    })

  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}