'use client'

import { useState } from 'react'

export default function DebugPage() {
  const [result, setResult] = useState('')
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('password123')

  const testLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      
      setResult(`
Status: ${response.status}
Response: ${JSON.stringify(data, null, 2)}
      `)
    } catch (error) {
      setResult(`Error: ${error.message}`)
    }
  }

  const testSignup = async () => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: `test${Date.now()}@example.com`, 
          password: 'password123',
          confirmPassword: 'password123'
        }),
      })

      const data = await response.json()
      
      setResult(`
Status: ${response.status}
Response: ${JSON.stringify(data, null, 2)}
      `)
    } catch (error) {
      setResult(`Error: ${error.message}`)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Authentication</h1>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Email:</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password:</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div className="space-x-4 mb-6">
        <button 
          onClick={testLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Login
        </button>
        <button 
          onClick={testSignup}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Test Signup
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-bold mb-2">Result:</h3>
        <pre className="whitespace-pre-wrap text-sm">{result}</pre>
      </div>
    </div>
  )
}
