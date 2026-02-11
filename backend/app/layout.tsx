export const metadata = {
  title: 'AI Clothing Brand Backend',
  description: 'Backend API for AI-powered clothing brand mockup generation',
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

