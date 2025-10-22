# RAG Chatbot - CRIC Buddy

A Retrieval-Augmented Generation (RAG) chatbot built with Next.js, featuring user authentication, rate limiting, and intelligent responses powered by Google's Gemini AI.

## Features

- 🤖 **RAG Technology**: Retrieval-Augmented Generation for accurate, context-aware responses
- 🔐 **User Authentication**: Secure login/signup with JWT tokens and bcrypt password hashing
- ⚡ **Rate Limiting**: 4 requests per minute per user to ensure fair usage
- 💬 **Real-time Chat**: Interactive chat interface with message history
- 🎨 **Modern UI**: Responsive design with Tailwind CSS
- 📊 **Vector Database**: MongoDB-based document storage with embeddings
- 🚀 **Vercel Ready**: Optimized for deployment on Vercel

## Tech Stack

- **Frontend**: Next.js 15, React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB Atlas
- **AI**: Google Gemini AI (Gemini Pro + Embeddings)
- **Authentication**: JWT tokens, bcrypt
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- Google AI Studio account (for Gemini API key)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rag-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rag-chatbot
   JWT_SECRET=your_jwt_secret_key_here
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_here
   ```

4. **Get your API keys**
   - **Gemini API Key**: Visit [Google AI Studio](https://aistudio.google.com/app/api-keys)
   - **MongoDB URI**: Create a cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - **JWT Secret**: Generate a random string for token signing

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
rag-chatbot/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.js
│   │   │   │   └── signup/route.js
│   │   │   └── chat/route.js
│   │   ├── chat/
│   │   │   └── page.js
│   │   ├── globals.css
│   │   ├── layout.js
│   │   └── page.js
│   ├── components/
│   │   └── ChatInterface.js
│   └── lib/
│       ├── auth.js
│       ├── config.js
│       ├── gemini.js
│       └── mongodb.js
├── next.config.js
├── tailwind.config.js
└── package.json
```

## How It Works

### RAG Implementation

1. **Document Processing**: Documents are stored in MongoDB with vector embeddings
2. **Query Processing**: User queries are converted to embeddings using Gemini
3. **Similarity Search**: Cosine similarity finds relevant documents
4. **Context Generation**: Top similar documents provide context
5. **Response Generation**: Gemini generates responses using the context

### Authentication Flow

1. User signs up/logs in
2. Password is hashed with bcrypt
3. JWT token is generated and stored
4. Token is sent with each API request
5. Server validates token for protected routes

### Rate Limiting

- Each user is limited to 20 requests per hour
- Rate limit resets every hour
- Counter stored in MongoDB user document
- Returns 429 status when limit exceeded

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Authenticate existing user

### Chat
- `POST /api/chat` - Send message and get AI response
  - Requires: Authorization header with Bearer token
  - Body: `{ message: string, chatId?: string }`
  - Response: `{ response: string, chatId: string, timestamp: Date }`

## Deployment on Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Visit [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy!

3. **Environment Variables in Vercel**
   - `GEMINI_API_KEY`
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NEXTAUTH_URL` (your Vercel domain)
   - `NEXTAUTH_SECRET`

## Usage

1. **Sign Up**: Create a new account with email and password
2. **Login**: Authenticate with existing credentials
3. **Chat**: Start asking questions to the RAG chatbot
4. **Rate Limit**: Be mindful of the 4 requests per minute limit

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: string,
  password: string (hashed),
  createdAt: Date,
  rateLimitCount: number,
  rateLimitReset: Date
}
```

### Chats Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  message: string,
  response: string,
  context: string,
  timestamp: Date,
  chatId: string
}
```

### Documents Collection (for RAG)
```javascript
{
  _id: ObjectId,
  content: string,
  embedding: number[],
  metadata: object,
  createdAt: Date
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Team

Built by Sujay Kumar Singh (Team 405) for the Minor Project requirement.

## Resources

- [RAG Documentation](https://aws.amazon.com/what-is/retrieval-augmented-generation)
- [Vector Databases](https://www.educative.io/courses/vector-database/introduction-to-vector-databases-and-embeddings)
- [Gemini API Docs](https://ai.google.dev/gemini-api/docs/quickstart)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
