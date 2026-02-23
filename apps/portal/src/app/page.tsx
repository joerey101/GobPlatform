export default function HomePage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-brand-600 to-brand-900 flex items-center justify-center">
            <div className="w-full max-w-md px-8 py-12 bg-white rounded-2xl shadow-2xl">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 mb-4">
                        <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Mi Estado</h1>
                    <p className="text-slate-500 mt-1 text-sm">Portal del Ciudadano</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                            Correo electrónico
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="tucorreo@email.com"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                         transition-all duration-200"
                        />
                    </div>

                    <button
                        id="btn-send-otp"
                        className="w-full py-3 px-6 bg-brand-600 hover:bg-brand-700 text-white font-semibold
                       rounded-xl transition-all duration-200 focus:outline-none focus:ring-2
                       focus:ring-brand-500 focus:ring-offset-2"
                    >
                        Continuar con código de verificación
                    </button>
                </div>

                <p className="mt-6 text-xs text-center text-slate-400">
                    Plataforma Integral de Gobierno — GobPlatform
                </p>
            </div>
        </main>
    )
}
