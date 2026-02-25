'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
    ArrowLeft,
    Settings,
    Mail,
    Phone,
    MessageSquare,
    MapPin,
    Lock,
    ChevronRight,
    LogOut,
    Edit2,
    Contact,
    Shield
} from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
    const router = useRouter()

    // Hardcoded initial data
    const [profile, setProfile] = useState({
        name: 'María Fernanda González',
        cuil: '20-34593102-7',
        email: 'mfernanda.gonzalez@gmail.com',
        phone: '+54 11 4932-8821',
        whatsapp: '+54 9 11 4932-8821',
        address: 'Av. Libertador 1245, 4° B, Vicente López'
    })

    // Edit modes
    const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({
        contact: false,
        address: false
    })

    // Temporary states for inputs
    const [tempContact, setTempContact] = useState({
        email: profile.email,
        phone: profile.phone,
        whatsapp: profile.whatsapp
    })
    const [tempAddress, setTempAddress] = useState(profile.address)

    const toggleEdit = (section: string) => {
        setEditMode(prev => ({ ...prev, [section]: !prev[section] }))
        if (section === 'contact') {
            setTempContact({
                email: profile.email,
                phone: profile.phone,
                whatsapp: profile.whatsapp
            })
        } else {
            setTempAddress(profile.address)
        }
    }

    const saveEdit = (section: string) => {
        if (section === 'contact') {
            setProfile(prev => ({ ...prev, ...tempContact }))
        } else {
            setProfile(prev => ({ ...prev, address: tempAddress }))
        }
        setEditMode(prev => ({ ...prev, [section]: false }))
    }

    return (
        <div className="flex justify-center min-h-screen bg-soft-gradient font-sans text-slate-900 pb-20">
            {/* Mobile Container wrapper */}
            <div className="w-full max-w-[480px] min-h-screen bg-white shadow-xl relative flex flex-col">

                {/* Header */}
                <header className="flex items-center justify-between px-5 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-slate-900 text-lg font-bold">Mi Perfil</h1>
                    </div>
                    <button className="flex items-center justify-center w-10 h-10 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>
                </header>

                <main className="flex-1 pb-10">

                    {/* Hero / Avatar Section */}
                    <section className="flex flex-col items-center pt-8 pb-10 px-5 space-y-4">
                        <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-blue-600/30 ring-4 ring-white animate-in zoom-in duration-500">
                            MF
                        </div>
                        <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
                            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mt-1">CUIL: {profile.cuil}</p>
                        </div>
                    </section>

                    <div className="px-5 space-y-6">

                        {/* Contact Info Section */}
                        <section className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <Contact className="w-[18px] h-[18px] text-slate-400" />
                                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Datos de contacto</h3>
                                </div>
                                {!editMode.contact && (
                                    <button
                                        onClick={() => toggleEdit('contact')}
                                        className="text-blue-600 hover:bg-blue-50 p-1 rounded-md transition-colors"
                                    >
                                        <Edit2 className="w-[18px] h-[18px]" />
                                    </button>
                                )}
                            </div>

                            <div className="glass-card p-5 rounded-2xl relative overflow-hidden transition-all duration-300">
                                {!editMode.contact ? (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="flex items-start gap-3">
                                            <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                                                <p className="text-sm font-semibold text-slate-700">{profile.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Teléfono</p>
                                                <p className="text-sm font-semibold text-slate-700">{profile.phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-5 h-5 flex items-center justify-center bg-green-500 rounded-full text-white shrink-0 mt-0.5">
                                                <MessageSquare className="w-3 h-3" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">WhatsApp</p>
                                                <p className="text-sm font-semibold text-slate-700">{profile.whatsapp}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-in slide-in-from-right-2 duration-300">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email</label>
                                            <input
                                                type="email"
                                                value={tempContact.email}
                                                onChange={(e) => setTempContact({ ...tempContact, email: e.target.value })}
                                                className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Teléfono</label>
                                            <input
                                                type="text"
                                                value={tempContact.phone}
                                                onChange={(e) => setTempContact({ ...tempContact, phone: e.target.value })}
                                                className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">WhatsApp</label>
                                            <input
                                                type="text"
                                                value={tempContact.whatsapp}
                                                onChange={(e) => setTempContact({ ...tempContact, whatsapp: e.target.value })}
                                                className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                            />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button
                                                onClick={() => toggleEdit('contact')}
                                                className="flex-1 bg-slate-50 text-slate-600 font-bold py-2 rounded-xl text-xs hover:bg-slate-100 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={() => saveEdit('contact')}
                                                className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-xl text-xs shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors"
                                            >
                                                Guardar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Domicilio Section */}
                        <section className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-[18px] h-[18px] text-slate-400" />
                                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Domicilio</h3>
                                </div>
                                {!editMode.address && (
                                    <button
                                        onClick={() => toggleEdit('address')}
                                        className="text-blue-600 hover:bg-blue-50 p-1 rounded-md transition-colors"
                                    >
                                        <Edit2 className="w-[18px] h-[18px]" />
                                    </button>
                                )}
                            </div>

                            <div className="glass-card p-5 rounded-2xl relative transition-all duration-300">
                                {!editMode.address ? (
                                    <div className="space-y-1 animate-in fade-in duration-300">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Dirección Registrada</p>
                                        <p className="text-sm font-semibold text-slate-700">{profile.address}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-in slide-in-from-right-2 duration-300">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nueva Dirección</label>
                                            <input
                                                type="text"
                                                value={tempAddress}
                                                onChange={(e) => setTempAddress(e.target.value)}
                                                className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => toggleEdit('address')}
                                                className="flex-1 bg-slate-50 text-slate-600 font-bold py-2 rounded-xl text-xs hover:bg-slate-100 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={() => saveEdit('address')}
                                                className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-xl text-xs shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors"
                                            >
                                                Guardar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Security Section */}
                        <section className="space-y-3">
                            <div className="px-1">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-[18px] h-[18px] text-slate-400" />
                                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Seguridad</h3>
                                </div>
                            </div>

                            <Link
                                href="/perfil/cambiar-contrasena"
                                className="w-full glass-card p-4 rounded-2xl flex items-center justify-between hover:bg-slate-50/50 transition-all active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-3 text-slate-700">
                                    <Lock className="w-5 h-5 text-slate-400" />
                                    <span className="text-sm font-bold">Cambiar contraseña</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300" />
                            </Link>
                        </section>

                        {/* Logout Button */}
                        <div className="pt-6 pb-4">
                            <button
                                onClick={() => signOut()}
                                className="w-full border border-red-200 bg-red-50 text-red-600 font-bold py-4 rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-all active:scale-[0.98]"
                            >
                                <LogOut className="w-5 h-5" />
                                Cerrar sesión
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
