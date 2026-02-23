import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await auth()
    if (!session) redirect('/login')

    const fullName = (session as any)['fullName'] ?? session.user?.name ?? 'Operador'
    const roles: string[] = (session as any)['roles'] ?? []
    const initials = fullName
        .split(' ')
        .slice(0, 2)
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()

    return (
        <div className="flex h-screen bg-background-light overflow-hidden font-display antialiased">
            <Sidebar
                userInitials={initials}
                userName={fullName}
                userRole={roles[0] ?? 'operador'}
            />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {children}
            </div>
        </div>
    )
}
