'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

    const [cuil, setCuil] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const formatCUIL = (value: string) => {
        const numbers = value.replace(/\D/g, '')
        if (numbers.length <= 2) return numbers
        if (numbers.length <= 10) return `${numbers.slice(0, 2)}-${numbers.slice(2)}`
        return `${numbers.slice(0, 2)}-${numbers.slice(2, 10)}-${numbers.slice(10, 11)}`
    }

    const handleChangeCUIL = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 11)
        setCuil(val)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const result = await signIn('credentials', {
                cuil,
                password,
                redirect: false,
                callbackUrl,
            })

            if (result?.error) {
                setError('CUIL o contraseña incorrectos')
            } else {
                router.push(callbackUrl)
            }
        } catch (err) {
            setError('Ocurrió un error inesperado. Reintentá luego.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Portal Vecinal</h1>
                    <p className="text-gray-600 mt-2 italic text-sm">Vicente López con vos</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CUIL / CUIT</label>
                        <input
                            type="text"
                            value={formatCUIL(cuil)}
                            onChange={handleChangeCUIL}
                            required
                            placeholder="20-XXXXXXXX-X"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-lg tracking-wider bg-gray-50 text-gray-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-lg bg-gray-50 text-gray-900"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="pt-4 text-center border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        ¿No tenés cuenta?
                        <a href="#" className="text-blue-600 font-medium ml-1">Contactanos</a>
                    </p>
                </div>
            </div>
        </div>
    )
}
