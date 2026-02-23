type Priority = 'p1' | 'p2' | 'p3' | 'p4' | 'p5'

const config: Record<Priority, { label: string; textClass: string; dotClass: string; pulse: boolean }> = {
    p1: { label: 'P1 Crítica', textClass: 'text-red-600', dotClass: 'bg-red-500', pulse: true },
    p2: { label: 'P2 Alta', textClass: 'text-orange-600', dotClass: 'bg-orange-500', pulse: true },
    p3: { label: 'P3 Media', textClass: 'text-slate-600', dotClass: 'bg-blue-500', pulse: false },
    p4: { label: 'P4 Baja', textClass: 'text-slate-600', dotClass: 'bg-slate-400', pulse: false },
    p5: { label: 'P5 Trivial', textClass: 'text-slate-500', dotClass: 'border border-slate-400', pulse: false },
}

export function PriorityIndicator({ priority }: { priority: Priority }) {
    const { label, textClass, dotClass, pulse } = config[priority]
    return (
        <div className="flex items-center gap-2">
            <div className="relative flex h-3 w-3">
                {pulse && (
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${dotClass}`} />
                )}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${dotClass}`} />
            </div>
            <span className={`text-xs font-semibold uppercase tracking-wide ${textClass}`}>{label}</span>
        </div>
    )
}
