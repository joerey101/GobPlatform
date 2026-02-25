import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Mi Estado — Portal del Ciudadano',
    description: 'Realizá trámites, consultá reclamos y gestioná tus beneficios en un solo lugar.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es">
            <body className="antialiased" suppressHydrationWarning>{children}</body>
        </html>
    )
}
