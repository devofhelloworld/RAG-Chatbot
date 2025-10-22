'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, Shield, Zap, Users, ArrowRight, Bot } from 'lucide-react'

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  const handleAuth = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.target)
    const email = formData.get('email')
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      // Store token and redirect to chat
      localStorage.setItem('token', data.token)
      router.push('/chat')

    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isAuthenticated) {
    router.push('/chat')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">RAG Chatbot</h1>
            </div>
            <nav className="flex space-x-4">
              <button 
                onClick={() => setIsLogin(true)}
                className="btn-primary"
              >
                Login
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className="btn-secondary"
              >
                Sign Up
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Intelligent RAG-Powered
            <span className="text-primary-600 block">Chatbot</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience the future of AI conversation with our Retrieval-Augmented Generation chatbot. 
            Get accurate, contextual answers powered by advanced vector databases and embeddings.
          </p>
          {/* <div className="flex justify-center space-x-4">
            <button className="btn-primary text-lg px-8 py-3 flex items-center">
              Start Chatting
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button className="btn-secondary text-lg px-8 py-3">
              Learn More
            </button>
          </div> */}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="card text-center">
            <MessageCircle className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">RAG Technology</h3>
            <p className="text-gray-600">
              Retrieval-Augmented Generation ensures accurate, context-aware responses 
              by combining language models with real-time data retrieval.
            </p>
          </div>
          
          <div className="card text-center">
            <Shield className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Secure Authentication</h3>
            <p className="text-gray-600">
              Robust user authentication system with JWT tokens and secure password hashing 
              to protect your conversations and data.
            </p>
          </div>
          
          <div className="card text-center">
            <Zap className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Rate Limiting</h3>
            <p className="text-gray-600">
              Smart rate limiting ensures fair usage with 4 requests per minute per user, 
              maintaining optimal performance for everyone.
            </p>
          </div>
        </div>

        {/* Authentication Modal */}
        {isLogin !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="card max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {isLogin ? 'Login' : 'Sign Up'}
                </h2>
                <button 
                  onClick={() => setIsLogin(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleAuth} className="space-y-4">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    className="input-field"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input 
                    type="password" 
                    name="password"
                    className="input-field"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input 
                      type="password" 
                      name="confirmPassword"
                      className="input-field"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className="btn-primary w-full disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                </button>
              </form>
              
              <div className="mt-4 text-center">
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary-600 hover:text-primary-700"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-3xl font-bold mb-8">Why Choose Our Chatbot?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">&lt;200ms</div>
              <div className="text-gray-600">Response Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">10K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">24/7</div>
              <div className="text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Bot className="h-6 w-6" />
            <span className="text-lg font-semibold">RAG Chatbot</span>
          </div>
          <p className="text-gray-400">
            Built with ❤️ by Team 405 | Powered by Next.js & Gemini AI
          </p>
        </div>
      </footer>
    </div>
  )
}
