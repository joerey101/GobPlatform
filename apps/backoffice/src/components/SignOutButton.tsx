'use client'

import { signOut } from 'next-auth/react'

export function SignOutButton({ compact }: { compact?: boolean }) {
    const handleSignOut = () => signOut({ callbackUrl: '/login' })

    if (compact) {
        return (
            <button
                onClick={handleSignOut}
                title="Cerrar sesión"
                className="text-white/50 hover:text-white transition-colors shrink-0"
            >
                <span className="material-symbols-outlined text-xl">logout</span>
            </button>
        )
    }

    return (
        <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500
                 hover:bg-slate-800 hover:text-white transition-all duration-150 text-xs font-medium"
        >
            <span className="material-symbols-outlined text-lg">logout</span>
            Cerrar sesión
        </button>
    )
}
