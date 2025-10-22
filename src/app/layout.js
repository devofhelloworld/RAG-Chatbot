import './globals.css'

export const metadata = {
  title: 'RAG Chatbot - Team 405',
  description: 'A RAG-based cricket chatbot with authentication and rate limiting',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}
