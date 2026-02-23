import { Suspense } from 'react'
import { LoginForm } from '@/components/LoginForm'

export default function LoginPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </main>
        }>
            <LoginForm />
        </Suspense>
    )
}
