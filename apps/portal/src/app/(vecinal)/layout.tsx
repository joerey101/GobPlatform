import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Home, ClipboardList, Calendar, Bell, User } from 'lucide-react'

export default async function VecinalLayout({ children }: { children: React.ReactNode }) {
    const session = await auth()
    if (!session) redirect('/login')

    return (
        <div className="min-h-screen bg-[#f6f7f8] pb-20 md:pb-0">
            {/* Header Desktop & Mobile */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4 md:px-8">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">V</div>
                    <span className="font-bold text-gray-900 hidden sm:inline-block">Portal Vecinal</span>
                </div>

                <div className="flex items-center gap-4">
                    <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                        <Bell className="w-6 h-6" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-gray-900 leading-none">{(session.user as any)?.fullName || session.user?.name}</p>
                            <p className="text-xs text-gray-500">{(session as any)?.cuil}</p>
                        </div>
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold border border-white shadow-sm">
                            {session.user?.name?.charAt(0) || 'V'}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-20 px-4 md:px-8 max-w-7xl mx-auto">
                {children}
            </main>

            {/* Bottom Navigation (Mobile) */}
            <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around md:hidden z-50">
                <Link href="/dashboard" className="flex flex-col items-center gap-1 text-blue-600">
                    <Home className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Inicio</span>
                </Link>
                <Link href="/solicitudes" className="flex flex-col items-center gap-1 text-gray-400">
                    <ClipboardList className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Solicitudes</span>
                </Link>
                <Link href="/turnos" className="flex flex-col items-center gap-1 text-gray-400">
                    <Calendar className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Turnos</span>
                </Link>
                <Link href="/notificaciones" className="flex flex-col items-center gap-1 text-gray-400">
                    <Bell className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Notif</span>
                </Link>
                <Link href="/perfil" className="flex flex-col items-center gap-1 text-gray-400">
                    <User className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Perfil</span>
                </Link>
            </nav>

            {/* Sidebar Left (Desktop Placeholder) */}
            {/* Si prefieres Sidebar en Desktop, lo configuramos aquí */}
        </div>
    )
}
