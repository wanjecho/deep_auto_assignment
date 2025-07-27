import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DeepAuto Chatbot',
  description: 'AI Chatbot powered by DeepAuto.ai Scaleserve API',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  )
} 