type SLAStatus = 'on_time' | 'at_risk' | 'overdue'

const config: Record<SLAStatus, { label: string; classes: string; dot: string }> = {
    on_time: {
        label: 'En plazo',
        classes: 'bg-green-100 text-green-800 border border-green-200',
        dot: 'bg-green-500',
    },
    at_risk: {
        label: 'En riesgo',
        classes: 'bg-amber-100 text-amber-800 border border-amber-200',
        dot: 'bg-amber-500',
    },
    overdue: {
        label: 'Vencido',
        classes: 'bg-red-100 text-red-800 border border-red-200',
        dot: 'bg-red-500',
    },
}

export function SLABadge({ status }: { status: SLAStatus }) {
    const { label, classes, dot } = config[status]
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dot}`} />
            {label}
        </span>
    )
}
