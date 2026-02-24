interface CitizenAvatarProps {
    src?: string
    name?: string
    fullName?: string
    dni?: string
    verified?: boolean
    pending?: boolean
    size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = { sm: 'size-9', md: 'size-14', lg: 'size-24', xl: 'size-32' }
const badgeTextSize = { sm: 'text-xl', md: 'text-3xl', lg: 'text-3xl', xl: 'text-5xl' }


export function CitizenAvatar({ src, name, fullName, verified, pending, size = 'md' }: CitizenAvatarProps) {
    const displayName = fullName || name
    const initials = displayName
        ? displayName.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
        : '?'

    return (
        <div className="relative inline-block">
            <div className={`${sizeClasses[size]} rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm`}>
                {src ? (
                    <img src={src} alt={displayName ?? 'Citizen'} className="w-full h-full object-cover" />
                ) : (
                    <span className={`material-symbols-outlined text-slate-400 ${badgeTextSize[size]}`}>person</span>
                )}
            </div>

            {verified && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-slate-100">
                    <span className="material-symbols-outlined text-blue-500 text-xl" title="Verificado">verified</span>
                </div>
            )}

            {pending && !verified && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-slate-100">
                    <span className="material-symbols-outlined text-amber-500 text-xl" title="Pendiente">history</span>
                </div>
            )}
        </div>
    )
}
