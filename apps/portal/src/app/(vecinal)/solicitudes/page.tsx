import { ArrowLeft, Search, Plus, MapPin, Tag, ChevronRight, MessageSquare, Clock, Lightbulb } from 'lucide-react'
import Link from 'next/link'

export default function RequestsListPage() {
    // Hardcoded data as requested
    const requests = [
        {
            id: '1',
            title: 'Ruidos molestos en la plaza',
            category: 'Seguridad y Orden Público',
            status: 'EN PROCESO',
            statusClass: 'bg-amber-500 text-white',
            sla: 'SLA VENCIDO',
            slaClass: 'bg-red-600 text-white',
            time: 'Hace 2 horas',
            comments: 2,
            icon: Tag
        },
        {
            id: '2',
            title: 'Bache en la calle San Martín',
            category: 'Mantenimiento Urbano',
            status: 'PENDIENTE',
            statusClass: 'bg-slate-500 text-white',
            sla: 'EN PLAZO',
            slaClass: 'bg-green-600 text-white',
            time: 'Hace 1 día',
            requestId: '#REQ-2023-8501',
            icon: MapPin
        },
        {
            id: '3',
            title: 'Luminaria apagada en Av. Libertador',
            category: 'Alumbrado Público',
            status: 'RESUELTO',
            statusClass: 'bg-green-600 text-white',
            time: 'Hace 3 días',
            icon: Lightbulb
        }
    ]

    return (
        <div className="flex justify-center min-h-screen bg-soft-gradient font-sans text-slate-900 pb-20">
            {/* Mobile Container wrapper */}
            <div className="w-full max-w-[480px] min-h-screen bg-white shadow-xl relative flex flex-col">

                {/* Header */}
                <header className="flex items-center justify-between px-5 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-slate-900 text-lg font-bold">Mis Solicitudes</h1>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 px-5 pt-6 pb-24">

                    {/* Filters / Tabs (Visual only) */}
                    <div className="flex gap-2 mb-8 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                        <button className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center bg-blue-600 text-white shadow-lg shadow-blue-600/20 transition-all">
                            Todas
                        </button>
                        <button className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-slate-500 text-center hover:bg-slate-100 transition-colors">
                            Abiertas
                        </button>
                        <button className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-slate-500 text-center hover:bg-slate-100 transition-colors">
                            Cerradas
                        </button>
                    </div>

                    {/* List of Cards */}
                    <div className="space-y-4">
                        {requests.map((req) => (
                            <Link
                                key={req.id}
                                href={`/solicitudes/${req.id}`}
                                className="block glass-card p-5 rounded-2xl relative group hover:scale-[1.01] transition-transform active:scale-[0.98]"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex gap-2">
                                        <span className={`inline-flex items-center rounded-full ${req.statusClass} px-2.5 py-0.5 text-[10px] font-bold shadow-sm ring-1 ring-inset ring-white/20`}>
                                            {req.status}
                                        </span>
                                        {req.sla && (
                                            <span className={`inline-flex items-center rounded-full ${req.slaClass} px-2.5 py-0.5 text-[10px] font-bold shadow-sm ring-1 ring-inset ring-white/20`}>
                                                {req.sla}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-medium text-slate-400">{req.time}</span>
                                </div>

                                <h3 className="text-base font-bold text-slate-900 mb-1">{req.title}</h3>
                                <div className="text-xs text-slate-500 mb-4 flex items-center gap-1">
                                    <req.icon className="w-3.5 h-3.5" />
                                    <span>{req.category}</span>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100/50">
                                    <div className="flex items-center gap-2">
                                        {req.comments ? (
                                            <>
                                                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                                                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400">{req.comments} comentarios</span>
                                            </>
                                        ) : req.requestId ? (
                                            <span className="text-[10px] font-bold text-slate-400">ID: {req.requestId}</span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-400">ID: #REQ-2023-{(1000 + Number(req.id))}</span>
                                        )}
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </main>

                {/* Floating Action Button */}
                <button className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/40 hover:scale-110 active:scale-95 transition-all z-30">
                    <Plus className="w-7 h-7" />
                </button>

            </div>
        </div>
    )
}
