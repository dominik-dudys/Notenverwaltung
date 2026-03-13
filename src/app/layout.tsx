import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const geist = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Studentenverwaltung",
  description: "Noten und Stundenplan verwalten",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={geist.className}>{children}</body>
    </html>
  )
}
