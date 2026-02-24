'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { SignOutButton } from '@/components/SignOutButton'

interface NavItem {
    href: string
    icon: string
    label: string
    badge?: number
}

const navItems: NavItem[] = [
    { href: '/', icon: 'home', label: 'Inicio' },
    { href: '/bandeja', icon: 'inbox', label: 'Bandeja', badge: 12 },
    { href: '/ciudadanos', icon: 'people', label: 'Ciudadanos' },
    { href: '/casos', icon: 'folder_open', label: 'Casos' },
    { href: '/reportes', icon: 'bar_chart', label: 'Reportes' },
]

interface SidebarProps {
    userInitials: string
    userName: string
    userRole: string
}

export function Sidebar({ userInitials, userName, userRole }: SidebarProps) {
    const pathname = usePathname()
    const [expanded, setExpanded] = useState(false)

    return (
        <aside
            className={`h-screen bg-[#0A2540] flex flex-col z-20 shrink-0 transition-all duration-300 ${expanded ? 'w-64' : 'w-[72px]'}`}
        >
            {/* Logo + toggle */}
            <div
                className="h-16 flex items-center justify-center border-b border-white/10 cursor-pointer"
                onClick={() => setExpanded(e => !e)}
                title={expanded ? 'Colapsar menú' : 'Expandir menú'}
            >
                <div className={`flex items-center ${expanded ? 'gap-3 px-5 w-full' : 'justify-center'}`}>
                    <div className="size-9 flex items-center justify-center bg-white/10 rounded-lg shrink-0">
                        <span className="material-symbols-outlined text-white text-xl">account_balance</span>
                    </div>
                    {expanded && (
                        <div>
                            <p className="text-white font-bold text-sm leading-tight">GobPlatform</p>
                            <p className="text-white/50 text-[10px] uppercase tracking-wider">Backoffice</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4 overflow-y-auto">
                {navItems.map(({ href, icon, label, badge }) => {
                    const isActive = pathname === href || pathname.startsWith(href + '/')
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center h-12 w-full transition-colors group relative
                                ${expanded ? 'px-4 gap-3' : 'justify-center'}
                                ${isActive
                                    ? 'bg-[#1A4B8F] text-white border-l-4 border-[#2c6bc3]'
                                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                                }`}
                            title={!expanded ? label : undefined}
                        >
                            <span className="material-symbols-outlined text-2xl shrink-0">{icon}</span>
                            {expanded && <span className="text-sm font-medium flex-1">{label}</span>}
                            {expanded && badge && (
                                <span className="bg-[#2c6bc3] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {badge}
                                </span>
                            )}
                            {!expanded && badge && (
                                <span className="absolute top-2 right-2 size-2 bg-[#2c6bc3] rounded-full" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer: settings + user */}
            <div className="border-t border-white/10">
                <Link
                    href="/configuracion"
                    className={`flex items-center h-12 w-full text-slate-300 hover:text-white hover:bg-white/5 transition-colors
                        ${expanded ? 'px-4 gap-3' : 'justify-center'}`}
                    title={!expanded ? 'Configuración' : undefined}
                >
                    <span className="material-symbols-outlined text-2xl shrink-0">settings</span>
                    {expanded && <span className="text-sm font-medium">Configuración</span>}
                </Link>

                <div className={`p-3 flex items-center gap-3 ${expanded ? '' : 'justify-center'}`}>
                    <div className="size-9 rounded-full bg-[#2c6bc3] flex items-center justify-center text-xs text-white font-bold border-2 border-slate-600 shrink-0">
                        {userInitials}
                    </div>
                    {expanded && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{userName}</p>
                            <p className="text-xs text-white/50 capitalize">{userRole}</p>
                        </div>
                    )}
                    {expanded && <SignOutButton compact />}
                </div>
            </div>
        </aside>
    )
}
