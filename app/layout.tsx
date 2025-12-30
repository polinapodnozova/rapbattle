import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Rap Battle',
  description: 'Battle an AI in an epic rap competition',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
