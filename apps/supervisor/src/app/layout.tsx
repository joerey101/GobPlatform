import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'GobPlatform — Panel de Supervisión',
    description: 'Panel de inteligencia de negocio y supervisión operativa.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es">
            <body style={{ fontFamily: inter.style.fontFamily, margin: 0 }}>{children}</body>
        </html>
    )
}
