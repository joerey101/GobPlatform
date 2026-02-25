import { auth } from '@/auth'
import { ClipboardList, PlusCircle, Calendar, Bell, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
    const session = await auth()
    const fullName = (session?.user as any)?.fullName || session?.user?.name || 'Vecino'
    const firstName = fullName.split(' ')[0]

    const quickActions = [
        { title: 'Mis Solicitudes', icon: ClipboardList, href: '/solicitudes', color: 'bg-blue-100 text-blue-600' },
        { title: 'Nueva Solicitud', icon: PlusCircle, href: '/solicitudes/nueva', color: 'bg-green-100 text-green-600' },
        { title: 'Mis Turnos', icon: Calendar, href: '/turnos', color: 'bg-purple-100 text-purple-600' },
        { title: 'Notificaciones', icon: Bell, href: '/notificaciones', color: 'bg-orange-100 text-orange-600' },
    ]

    return (
        <div className="py-6 space-y-8">
            {/* Header / Greeting */}
            <section className="space-y-1">
                <h2 className="text-2xl font-bold text-gray-900">Buen día, {firstName} 👋</h2>
                <p className="text-gray-500">¿En qué podemos ayudarte hoy?</p>
            </section>

            {/* Quick Actions Grid */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                    <Link
                        key={action.title}
                        href={action.href}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow group"
                    >
                        <div className={`p-3 rounded-xl ${action.color} group-hover:scale-110 transition-transform`}>
                            <action.icon className="w-8 h-8" />
                        </div>
                        <span className="font-semibold text-gray-800 text-sm md:text-base">{action.title}</span>
                    </Link>
                ))}
            </section>

            {/* Resume / Recent Activity */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Solicitudes Recientes */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-800">Solicitudes recientes</h3>
                        <Link href="/solicitudes" className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:underline">
                            Ver todas <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
                        {/* Placeholder for real data */}
                        <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="space-y-1">
                                <p className="font-semibold text-gray-900">Ruidos molestos</p>
                                <p className="text-xs text-gray-500">Iniciada el 24/02/2026</p>
                            </div>
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">EN PROCESO</span>
                        </div>
                        <div className="p-4 flex items-center justify-center text-gray-400 py-12 italic text-sm">
                            Próximamente verás aquí tus solicitudes reales.
                        </div>
                    </div>
                </section>

                {/* Notificaciones Recientes */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-800">Últimas notificaciones</h3>
                        <Link href="/notificaciones" className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:underline">
                            Ver todas <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 flex gap-4 items-start hover:bg-gray-50 transition-colors border-b border-gray-50">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Bell className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-gray-900">Bienvenido al nuevo Portal Vecinal</p>
                                <p className="text-xs text-gray-500">Estamos modernizando la atención para estar más cerca tuyo.</p>
                                <p className="text-[10px] text-gray-400">Hace 2 horas</p>
                            </div>
                        </div>
                        <div className="p-8 flex flex-col items-center justify-center text-center text-gray-400 gap-2">
                            <p className="text-sm italic">No tenés otras notificaciones pendientes.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
