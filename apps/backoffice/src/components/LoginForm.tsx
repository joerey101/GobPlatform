'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        })

        setLoading(false)

        if (result?.error) {
            setError('Email o contraseña incorrectos')
            return
        }

        router.replace(callbackUrl)
    }

    return (
        <main className="min-h-screen h-screen overflow-hidden relative flex flex-col items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0A2540 0%, #1A4B8F 100%)' }}>

            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <svg className="absolute top-0 right-0 opacity-10" fill="none" height="600" viewBox="0 0 600 600" width="600">
                    <circle cx="450" cy="150" fill="white" r="300" />
                </svg>
                <svg className="absolute bottom-0 left-0 opacity-5" fill="none" height="800" viewBox="0 0 800 800" width="800">
                    <rect fill="white" height="600" rx="100" transform="rotate(-45 -100 500)" width="600" x="-100" y="500" />
                </svg>
            </div>

            {/* Card */}
            <div className="z-10 w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-8 pt-10 pb-6 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="size-14 flex items-center justify-center rounded-xl shadow-md"
                            style={{ backgroundColor: '#2c6bc3' }}>
                            <span className="material-symbols-outlined text-white text-3xl">account_balance</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-1 tracking-tight">GobPlatform</h1>
                    <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Backoffice Administrativo</p>
                </div>

                {/* Form */}
                <div className="px-8 pb-10">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {/* Email */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                                Correo electrónico
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 text-xl">mail</span>
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nombre@gobierno.gob"
                                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg
                                        focus:outline-none focus:ring-2 focus:border-transparent
                                        text-slate-900 placeholder-slate-400 text-sm transition-all"
                                    style={{ '--tw-ring-color': '#2c6bc3' } as React.CSSProperties}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                                    Contraseña
                                </label>
                                <a href="#" className="text-xs font-medium hover:underline" style={{ color: '#2c6bc3' }}>
                                    ¿Olvidó su contraseña?
                                </a>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 text-xl">lock</span>
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg
                                        focus:outline-none focus:ring-2 focus:border-transparent
                                        text-slate-900 placeholder-slate-400 text-sm transition-all"
                                />
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-red-500 text-sm">error</span>
                                <p className="text-xs text-red-600 font-medium">{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <div className="pt-2">
                            <button
                                id="btn-login"
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 text-sm font-bold rounded-lg
                                    text-white disabled:opacity-60 transition-all duration-200 shadow-lg"
                                style={{ backgroundColor: loading ? '#94a3b8' : '#2c6bc3' }}
                            >
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                    <span className="material-symbols-outlined text-blue-300 group-hover:text-blue-200 text-xl">
                                        {loading ? 'hourglass_top' : 'login'}
                                    </span>
                                </span>
                                {loading ? 'Verificando...' : 'Ingresar al sistema'}
                            </button>
                        </div>

                        {/* Security note */}
                        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 bg-slate-50 py-2 rounded-lg border border-slate-100">
                            <span className="material-symbols-outlined text-base">verified_user</span>
                            <span>Acceso seguro encriptado</span>
                        </div>
                    </form>
                </div>
            </div>

            {/* Footer links */}
            <div className="mt-8 flex gap-6 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
                <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
                <a href="#" className="hover:text-white transition-colors">Términos de servicio</a>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
                <a href="#" className="hover:text-white transition-colors">Soporte</a>
            </div>
            <p className="mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                © 2025 GobPlatform. Todos los derechos reservados.
            </p>
        </main>
    )
}
