const { MongoClient } = require('mongodb')
const config = require('./config')

let client
let db

async function connectToDatabase() {
  if (client && db) {
    return { client, db }
  }

  try {
    client = new MongoClient(config.MONGODB_URI)
    await client.connect()
    db = client.db('rag-chatbot')
    
    console.log('Connected to MongoDB')
    return { client, db }
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw error
  }
}

async function getDatabase() {
  const { db } = await connectToDatabase()
  return db
}

async function closeConnection() {
  if (client) {
    await client.close()
    client = null
    db = null
    console.log('Disconnected from MongoDB')
  }
}

module.exports = {
  connectToDatabase,
  getDatabase,
  closeConnection
}
