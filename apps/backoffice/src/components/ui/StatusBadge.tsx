type Status = 'open' | 'in_progress' | 'on_hold' | 'closed' | 'cancelled' | 'pending' | 'resolved' | 'rejected'

const config: Record<Status, { label: string; classes: string }> = {
    open: { label: 'Abierto', classes: 'bg-blue-100 text-blue-800 border border-blue-200' },
    in_progress: { label: 'En Proceso', classes: 'bg-purple-100 text-purple-800 border border-purple-200' },
    on_hold: { label: 'En Espera', classes: 'bg-orange-100 text-orange-800 border border-orange-200' },
    pending: { label: 'Pendiente', classes: 'bg-amber-100 text-amber-800 border border-amber-200' },
    closed: { label: 'Cerrado', classes: 'bg-slate-100 text-slate-800 border border-slate-200' },
    cancelled: { label: 'Cancelado', classes: 'bg-red-100 text-red-800 border border-red-200' },
    resolved: { label: 'Resuelto', classes: 'bg-green-100 text-green-800 border border-green-200' },
    rejected: { label: 'Rechazado', classes: 'bg-red-100 text-red-800 border border-red-200' },
}

export function StatusBadge({ status }: { status: Status }) {
    const { label, classes } = config[status]
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${classes}`}>
            {label}
        </span>
    )
}
