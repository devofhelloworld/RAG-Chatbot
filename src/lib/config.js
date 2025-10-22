
const config = {
  // Gemini AI Configuration
  GEMINI_API_KEY:process.env.GEMINI_API_KEY,
  
  // MongoDB Configuration
  MONGODB_URI: process.env.MONGODB_URI,
  
  // JWT Secret for authentication
  JWT_SECRET: process.env.JWT_SECRET,
  
  // Next.js Configuration
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  
  // Rate limiting configuration
  RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 20, // 4 requests per hour
}

module.exports = config
