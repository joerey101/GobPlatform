'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, ChevronRight, Info, AlertTriangle, Store, Landmark, FileText, Check } from 'lucide-react'
import Link from 'next/link'

type ServiceType = {
    id: string;
    title: string;
    description: string;
    icon: any;
    color: string;
}

const services: ServiceType[] = [
    {
        id: 'reclamo',
        title: 'Reclamo General',
        description: 'Baches, luminarias, ruidos, residuos.',
        icon: AlertTriangle,
        color: 'bg-orange-100 text-orange-600'
    },
    {
        id: 'permiso',
        title: 'Permiso Comercial',
        description: 'Habilitaciones y renovaciones.',
        icon: Store,
        color: 'bg-blue-100 text-blue-600'
    },
    {
        id: 'datos',
        title: 'Actualización de datos',
        description: 'Cambio de domicilio o contacto.',
        icon: Landmark,
        color: 'bg-green-100 text-green-600'
    }
]

export default function NewRequestPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [selectedService, setSelectedService] = useState<ServiceType | null>(null)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')

    const nextStep = () => setStep(step + 1)
    const prevStep = () => setStep(step - 1)

    const handleSubmit = () => {
        // Mock submission
        router.push('/solicitudes')
    }

    const isNextDisabled = () => {
        if (step === 1) return !selectedService;
        if (step === 2) return title.trim().length === 0;
        return false;
    };

    return (
        <div className="flex justify-center min-h-screen bg-soft-gradient font-sans text-slate-900 pb-20">
            {/* Mobile Container wrapper */}
            <div className="w-full max-w-[480px] min-h-screen bg-white shadow-xl relative flex flex-col">

                {/* Header & Stepper Sticky Container */}
                <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
                    <header className="flex items-center justify-between px-5 py-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => step === 1 ? router.push('/dashboard') : prevStep()}
                                className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-slate-900 text-lg font-bold">Nueva Solicitud</h1>
                        </div>
                    </header>

                    {/* Stepper */}
                    <div className="px-8 pb-5">
                        <div className="flex items-center justify-between relative">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all ${step >= 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-100 text-slate-400'}`}>
                                {step > 1 ? <Check className="w-4 h-4" /> : '1'}
                            </div>
                            <div className={`h-[2px] flex-1 mx-3 transition-colors ${step > 1 ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all ${step >= 2 ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-100 text-slate-400'}`}>
                                {step > 2 ? <Check className="w-4 h-4" /> : '2'}
                            </div>
                            <div className={`h-[2px] flex-1 mx-3 transition-colors ${step > 2 ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all ${step >= 3 ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-100 text-slate-400'}`}>
                                3
                            </div>
                        </div>
                        <div className="flex justify-between mt-2 px-1">
                            <span className={`text-[10px] font-bold uppercase ${step >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>Servicio</span>
                            <span className={`text-[10px] font-bold uppercase ${step >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>Detalle</span>
                            <span className={`text-[10px] font-bold uppercase ${step >= 3 ? 'text-slate-900' : 'text-slate-400'}`}>Resumen</span>
                        </div>
                    </div>
                </div>

                <main className="flex-1 px-5 py-4">

                    {/* Step 1: Selection */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold text-slate-900">¿Qué necesitás hoy?</h2>
                                <p className="text-sm text-slate-500">Seleccioná el tipo de trámite que querés iniciar.</p>
                            </div>

                            <div className="space-y-4">
                                {services.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedService(s)}
                                        className={`w-full glass-card p-5 rounded-2xl flex items-center gap-4 text-left transition-all relative ${selectedService?.id === s.id ? 'ring-2 ring-blue-600 bg-blue-50/10' : 'hover:bg-slate-50/50'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
                                            <s.icon className="w-7 h-7" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900">{s.title}</h3>
                                            <p className="text-xs text-slate-500">{s.description}</p>
                                        </div>
                                        {selectedService?.id === s.id && (
                                            <CheckCircle className="w-6 h-6 text-blue-600" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Form */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold text-slate-900">Contanos más</h2>
                                <p className="text-sm text-slate-500">Brindanos detalles para agilizar tu pedido.</p>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Título de la solicitud</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Ej: Luminaria apagada en mi cuadra"
                                        className="w-full bg-white/50 backdrop-blur-md border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Descripción detallada</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Explicá brevemente el problema observando horarios o referencias..."
                                        rows={4}
                                        className="w-full bg-white/50 backdrop-blur-md border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all resize-none"
                                    ></textarea>
                                </div>

                                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex gap-3">
                                    <Info className="w-5 h-5 text-blue-600 shrink-0" />
                                    <p className="text-xs text-blue-800 leading-relaxed font-medium">
                                        Podrás adjuntar fotos una vez creada la solicitud desde la pantalla de detalle.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Summary */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold text-slate-900">Revisá tu pedido</h2>
                                <p className="text-sm text-slate-500">Verificá que todo esté correcto antes de enviar.</p>
                            </div>

                            <div className="glass-card p-6 rounded-3xl space-y-6">
                                <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedService?.color}`}>
                                        {selectedService && <selectedService.icon className="w-7 h-7" />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trámite seleccionado</p>
                                        <h3 className="font-bold text-slate-900 text-lg">{selectedService?.title}</h3>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Título de la solicitud</p>
                                        <p className="text-base font-semibold text-slate-800">{title}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Descripción detallada</p>
                                        <p className="text-sm text-slate-600 leading-relaxed italic">
                                            "{description || 'Sin descripción adicional'}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100 flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                                <p className="text-xs text-amber-800 leading-relaxed">
                                    Al enviar, un operador revisará tu pedido y se te notificará cualquier avance.
                                </p>
                            </div>
                        </div>
                    )}
                </main>

                {/* Footer Buttons */}
                <footer className="p-5 pb-8 bg-white border-t border-slate-100 flex gap-3 z-20">
                    {step > 1 && (
                        <button
                            onClick={prevStep}
                            className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 font-bold py-3.5 px-4 rounded-xl text-sm hover:bg-slate-100 transition-colors"
                        >
                            Volver
                        </button>
                    )}

                    {step < 3 ? (
                        <button
                            onClick={nextStep}
                            disabled={isNextDisabled()}
                            className="flex-[2] bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-2"
                        >
                            Continuar
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="flex-[2] bg-green-50 border border-green-200 text-green-700 font-bold py-3.5 px-4 rounded-xl text-sm shadow-sm hover:bg-green-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Enviar pedido
                        </button>
                    )}
                </footer>
            </div>
        </div>
    )
}
