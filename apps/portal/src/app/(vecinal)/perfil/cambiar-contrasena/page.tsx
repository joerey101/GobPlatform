'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Lock } from 'lucide-react'

export default function ChangePasswordPage() {
    const router = useRouter()

    return (
        <div className="flex justify-center min-h-screen bg-soft-gradient font-sans text-slate-900 pb-20">
            <div className="w-full max-w-[480px] min-h-screen bg-white shadow-xl relative flex flex-col">
                <header className="flex items-center justify-between px-5 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-slate-900 text-lg font-bold">Cambiar contraseña</h1>
                    </div>
                </header>

                <main className="flex-1 p-10 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Lock className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-slate-900">Página en construcción</h2>
                        <p className="text-sm text-slate-500">Próximamente podrás gestionar tu seguridad desde aquí.</p>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
                    >
                        Volver al perfil
                    </button>
                </main>
            </div>
        </div>
    )
}
