import { auth } from '@/auth'

const stats = [
    { label: 'Casos abiertos', value: '—', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: '📋' },
    { label: 'Trámites pendientes', value: '—', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: '⏳' },
    { label: 'Resueltos hoy', value: '—', color: 'bg-green-50 text-green-700 border-green-100', icon: '✅' },
    { label: 'SLA en riesgo', value: '—', color: 'bg-red-50 text-red-700 border-red-100', icon: '⚠️' },
]

export default async function DashboardPage() {
    const session = await auth()
    const fullName = (session as any)?.['fullName'] ?? 'Operador'

    return (
        <div className="space-y-6">
            {/* Bienvenida */}
            <div className="bg-white rounded-2xl border border-slate-200 px-6 py-5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
                        <span className="text-white text-lg font-bold">
                            {fullName.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">
                            Bienvenido, {fullName.split(' ')[0]}
                        </h1>
                        <p className="text-sm text-slate-500">
                            Panel de operaciones — GobPlatform
                        </p>
                    </div>
                    <div className="ml-auto text-right">
                        <p className="text-xs text-slate-400">
                            {new Date().toLocaleDateString('es-AR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className={`rounded-2xl border px-5 py-4 flex flex-col gap-2 ${stat.color}`}
                    >
                        <span className="text-2xl">{stat.icon}</span>
                        <div>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-xs font-medium opacity-80 mt-0.5">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Próximamente */}
            <div className="bg-white rounded-2xl border border-slate-200 px-6 py-8 text-center">
                <p className="text-slate-400 text-sm">
                    📬 La bandeja de trabajo se implementa en{' '}
                    <span className="font-semibold text-slate-600">Fase 3 — Consola Operativa</span>
                </p>
            </div>
        </div>
    )
}
