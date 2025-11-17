import '../styles/globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sachinthya Portfolio Admin',
  description: 'Admin panel for managing Sachinthya\'s portfolio content',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-nunito-sans">{children}</body>
    </html>
  )
}