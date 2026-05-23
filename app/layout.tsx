import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Train",
  description: "Track your training, earn coins, level up.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
