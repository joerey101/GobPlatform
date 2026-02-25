'use client'

import { useState } from 'react'
import { ArrowLeft, Bell, Calendar, CheckCircle2, Info, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Notification = {
    id: string;
    title: string;
    description: string;
    time: string;
    isRead: boolean;
    icon: any;
    iconColor: string;
}

const initialNotifications: Notification[] = [
    {
        id: '1',
        title: 'Tu solicitud #8492 fue actualizada',
        description: 'El estado de tu reclamo ha cambiado a "En Proceso" por un operador municipal.',
        time: 'Hace 15 min',
        isRead: false,
        icon: Bell,
        iconColor: 'bg-blue-100 text-blue-600'
    },
    {
        id: '2',
        title: 'Turno confirmado: Licencia de Conducir',
        description: 'Te esperamos mañana 25 de febrero a las 09:30 hs en el centro municipal.',
        time: 'Hace 2 horas',
        isRead: false,
        icon: Calendar,
        iconColor: 'bg-blue-100 text-blue-600'
    },
    {
        id: '3',
        title: 'Solicitud finalizada con éxito',
        description: 'El reporte de bache en calle San Martín ha sido resuelto. ¡Gracias por participar!',
        time: 'Ayer, 18:45',
        isRead: true,
        icon: CheckCircle2,
        iconColor: 'bg-slate-100 text-slate-400'
    },
    {
        id: '4',
        title: 'Mantenimiento de sistema programado',
        description: 'El portal estará fuera de servicio este domingo de 02:00 a 04:00 por mejoras.',
        time: 'Hace 3 días',
        isRead: true,
        icon: Info,
        iconColor: 'bg-slate-100 text-slate-400'
    }
]

export default function NotificationsPage() {
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)

    const unreadCount = notifications.filter(n => !n.isRead).length

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, isRead: true, iconColor: 'bg-slate-100 text-slate-400' } : n
        ))
    }

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({
            ...n,
            isRead: true,
            iconColor: 'bg-slate-100 text-slate-400'
        })))
    }

    return (
        <div className="flex justify-center min-h-screen bg-soft-gradient font-sans text-slate-900 pb-20">
            {/* Mobile Container wrapper */}
            <div className="w-full max-w-[480px] min-h-screen bg-white shadow-xl relative flex flex-col">

                {/* Header */}
                <header className="flex items-center justify-between px-5 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            <h1 className="text-slate-900 text-lg font-bold">Notificaciones</h1>
                            {unreadCount > 0 && (
                                <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg shadow-blue-600/20 animate-in zoom-in duration-300">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-blue-600 text-xs font-bold hover:underline transition-all"
                        >
                            Marcar todo como leído
                        </button>
                    )}
                </header>

                <main className="flex-1 px-5 py-6">
                    {notifications.length > 0 ? (
                        <div className="space-y-4">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => markAsRead(n.id)}
                                    className={`notification-item glass-card p-4 rounded-2xl flex gap-4 cursor-pointer transition-all duration-300 active:scale-[0.98] ${n.isRead ? 'opacity-70 bg-white/40' : 'bg-white/70'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${n.iconColor}`}>
                                        <n.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className={`text-sm font-bold leading-tight transition-colors duration-300 ${n.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                                                {n.title}
                                            </h3>
                                            {!n.isRead && (
                                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 shrink-0 shadow-[0_0_8px_rgba(37,99,235,0.5)] animate-pulse"></div>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed">{n.description}</p>
                                        <p className="text-[10px] font-medium text-slate-400">{n.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                <Bell className="w-10 h-10" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-bold text-slate-900">No tenés notificaciones</p>
                                <p className="text-xs text-slate-500 px-10">Te avisaremos cuando haya novedades sobre tus trámites o servicios municipales.</p>
                            </div>
                        </div>
                    )}
                </main>

            </div>
        </div>
    )
}
