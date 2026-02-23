'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') ?? '/'

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
        <main className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center">
            <div className="w-full max-w-sm px-8 py-12 bg-white rounded-2xl shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-slate-900">Consola Operativa</h1>
                    <p className="text-slate-500 mt-1 text-xs uppercase tracking-widest">GobPlatform — Backoffice</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                            Usuario
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="operador@organismo.gob.ar"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900
                         focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent
                         text-sm transition-all duration-200"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900
                         focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent
                         text-sm transition-all duration-200"
                        />
                    </div>

                    {error && (
                        <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-xs text-red-600 font-medium">{error}</p>
                        </div>
                    )}

                    <button
                        id="btn-login"
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 px-6 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400
                       text-white text-sm font-semibold rounded-xl transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 mt-2"
                    >
                        {loading ? 'Verificando...' : 'Ingresar al sistema'}
                    </button>
                </form>
            </div>
        </main>
    )
}
