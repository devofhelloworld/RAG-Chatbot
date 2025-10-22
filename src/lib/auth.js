const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('./config')

// Hash password
async function hashPassword(password) {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Verify password
async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword)
}

// Generate JWT token
function generateToken(userId) {
  return jwt.sign({ userId }, config.JWT_SECRET, { expiresIn: '7d' })
}

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, config.JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Extract token from request headers
function extractTokenFromHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  extractTokenFromHeader
}
