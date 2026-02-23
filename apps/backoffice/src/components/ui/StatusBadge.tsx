type Status =
    | 'pending'
    | 'in_progress'
    | 'waiting_citizen'
    | 'waiting_internal'
    | 'resolved'
    | 'closed'
    | 'cancelled'
    | 'open'
    | 'on_hold'
    | 'rejected'
    | string  // fallback for unknown values

const config: Record<string, { label: string; classes: string }> = {
    pending: { label: 'Pendiente', classes: 'bg-slate-100 text-slate-600' },
    open: { label: 'Abierto', classes: 'bg-blue-100 text-blue-700' },
    in_progress: { label: 'En Proceso', classes: 'bg-amber-100 text-amber-700' },
    waiting_citizen: { label: 'Esp. Ciudadano', classes: 'bg-purple-100 text-purple-700' },
    waiting_internal: { label: 'Esp. Interno', classes: 'bg-orange-100 text-orange-700' },
    on_hold: { label: 'En Espera', classes: 'bg-yellow-100 text-yellow-700' },
    resolved: { label: 'Resuelto', classes: 'bg-green-100 text-green-700' },
    closed: { label: 'Cerrado', classes: 'bg-slate-200 text-slate-500' },
    cancelled: { label: 'Cancelado', classes: 'bg-red-100 text-red-600' },
    rejected: { label: 'Rechazado', classes: 'bg-red-100 text-red-700' },
}

const fallback = { label: 'Desconocido', classes: 'bg-slate-100 text-slate-500' }

export function StatusBadge({ status }: { status: string }) {
    const { label, classes } = config[status] ?? fallback
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${classes}`}>
            {label}
        </span>
    )
}
