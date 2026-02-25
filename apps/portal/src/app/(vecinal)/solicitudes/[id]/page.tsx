import { ArrowLeft, Bell, User, Clock, FileText, MapPin, History, MessageSquare, PlusCircle } from 'lucide-react'
import Link from 'next/link'

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    // Hardcoded data as requested
    const request = {
        id: '#REQ-2023-8492',
        title: 'Ruidos molestos en la plaza',
        category: 'Seguridad y Orden Público',
        status: 'EN PROCESO',
        priority: 'P1 CRÍTICA',
        slaMessage: 'SLA Vencido hace 2h',
        description: 'Se reportan ruidos molestos provenientes de una fiesta en la plaza central fuera del horario permitido. Los vecinos no pueden dormir debido al volumen de la música. Se ha llamado a seguridad ciudadana sin respuesta.',
        date: '14 Oct 2023, 22:30',
        location: 'Plaza de Armas, Sector Norte',
        timeline: [
            { title: 'Solicitud actualizada', date: 'Hoy, 09:15', description: 'Se ha derivado el caso a inspección municipal para visita en terreno.', iconColor: 'bg-blue-600', opacity: 'opacity-100' },
            { title: 'En proceso', date: 'Ayer, 14:30', description: 'La solicitud ha sido revisada y categorizada como prioridad alta.', iconColor: 'bg-slate-300', opacity: 'opacity-80' },
            { title: 'Asignado a Mesa', date: 'Hace 2 días', description: 'Operador J. Pérez asignó el ticket al departamento correspondiente.', iconColor: 'bg-slate-300', opacity: 'opacity-60' },
            { title: 'Solicitud Creada', date: 'Hace 2 días', description: 'Solicitud ingresada vía App Móvil.', iconColor: 'bg-slate-300', opacity: 'opacity-40' },
        ],
        heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlu58RBqwva85mlBylSwoysqnBgKLei3z6pZcZY7CoYsex4u53oDNgtQXY5xP5FTJQwKYiiwp2kanGiQqgEqtgVOCEhtFOsNUr755bqGnOG9q5W2tX0lBxRF8POc40YAkHYG9zci16xDdE6NgKMZELS3OEfiKsAKIho43N1mBG4TuYyxldqUdyZAvWr4UjJ8_awvu4u4y-0XdcYBVmdz6rFLfJnqsRpvkCIb_M38ZgJMRYN4USRhkj7799dP0cRkJH6QNAWAbbxy3i'
    }

    return (
        <div className="flex justify-center min-h-screen bg-soft-gradient font-sans text-slate-900 overflow-y-auto">
            {/* Mobile-centric Container */}
            <div className="w-full max-w-[480px] min-h-screen bg-white shadow-xl relative flex flex-col">

                {/* Header */}
                <header className="flex items-center justify-between px-5 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-slate-900 text-lg font-bold">Detalle de Solicitud</h1>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors">
                            <Bell className="w-5 h-5" />
                        </button>
                        <button className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm">
                            <User className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 pb-32">
                    {/* Hero Section */}
                    <div className="relative w-full h-64 bg-slate-200">
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url('${request.heroImage}')` }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 w-full p-5 text-white">
                            <div className="flex gap-2 mb-3 flex-wrap">
                                <span className="inline-flex items-center rounded-full bg-amber-500/90 backdrop-blur-sm px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm ring-1 ring-inset ring-white/20">
                                    {request.status}
                                </span>
                                <span className="inline-flex items-center rounded-full bg-red-600/90 backdrop-blur-sm px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm ring-1 ring-inset ring-white/20">
                                    {request.priority}
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold leading-tight mb-1">{request.title}</h2>
                            <p className="text-slate-200 text-sm font-medium opacity-90">{request.category}</p>
                            <div className="mt-3 flex items-center gap-2 text-xs text-red-200 bg-red-900/40 backdrop-blur-md w-fit px-3 py-1.5 rounded-lg border border-red-500/30">
                                <Clock className="w-4 h-4" />
                                <span>{request.slaMessage}</span>
                            </div>
                        </div>
                    </div>

                    <div className="px-5 -mt-4 relative z-10 space-y-6">
                        {/* Description Section */}
                        <section>
                            <div className="flex items-center gap-2 mb-3 mt-8">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <h3 className="text-slate-900 text-sm font-bold tracking-wide uppercase">Descripción</h3>
                            </div>
                            <div className="glass-card p-5 rounded-xl">
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    {request.description}
                                </p>
                                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                                    <span>ID: {request.id}</span>
                                    <span>{request.date}</span>
                                </div>
                            </div>
                        </section>

                        {/* Location Map Placeholder */}
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <MapPin className="w-5 h-5 text-blue-600" />
                                <h3 className="text-slate-900 text-sm font-bold tracking-wide uppercase">Ubicación</h3>
                            </div>
                            <div className="rounded-xl overflow-hidden shadow-sm h-32 relative bg-slate-100 border border-slate-200">
                                <div className="w-full h-full bg-[#e5e7eb] relative" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <MapPin className="w-8 h-8 text-red-500 drop-shadow-md animate-bounce" />
                                    </div>
                                </div>
                                <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-lg text-xs font-medium text-slate-600 shadow-sm border border-slate-100 flex justify-between items-center">
                                    <span>{request.location}</span>
                                    <span className="text-blue-600 font-bold">Ver mapa</span>
                                </div>
                            </div>
                        </section>

                        {/* Timeline Section */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <History className="w-5 h-5 text-blue-600" />
                                <h3 className="text-slate-900 text-sm font-bold tracking-wide uppercase">Línea de Tiempo</h3>
                            </div>
                            <div className="glass-card rounded-xl p-5">
                                <div className="relative pl-4 border-l-2 border-slate-200 space-y-8 my-2">
                                    {request.timeline.map((item, index) => (
                                        <div key={index} className={`relative ${item.opacity}`}>
                                            <span className={`absolute -left-[23px] top-1 h-3.5 w-3.5 rounded-full ${index === 0 ? 'bg-blue-600 ring-4 ring-white shadow-sm' : 'bg-slate-300 ring-4 ring-white'}`}></span>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                                                    <span className={`text-xs font-medium ${index === 0 ? 'text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full' : 'text-slate-400'}`}>{item.date}</span>
                                                </div>
                                                <p className="text-xs text-slate-500">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>
                </main>

                {/* Bottom Action Bar */}
                <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                    <div className="flex gap-3">
                        <button className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Comentar
                        </button>
                        <button className="flex-1 bg-blue-600 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                            <PlusCircle className="w-4 h-4" />
                            Agregar comentario
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
