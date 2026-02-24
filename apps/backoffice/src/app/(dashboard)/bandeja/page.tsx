import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db, request, citizen, serviceCatalog } from '@repo/db'
import { getRequests } from '@repo/db/src/queries/bandeja'
import { BandejaLayout } from './components/BandejaLayout'

// ─── SLA runtime helper ─────────────────────────────────────────────────────
type SlaStatus = 'on_time' | 'at_risk' | 'overdue'

function calculateSlaStatus(dueAt: Date | null, status: string): SlaStatus {
    if (!dueAt || status === 'closed' || status === 'resolved') return 'on_time'
    const now = new Date()
    const msLeft = dueAt.getTime() - now.getTime()
    const hoursLeft = msLeft / (1000 * 60 * 60)

    if (hoursLeft < 0) return 'overdue'
    if (hoursLeft < 48) return 'at_risk' // configurable, hardcoded 48h para demo
    return 'on_time'
}

function formatRelativeDate(date: Date | null) {
    if (!date) return ''
    const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })
    const diffDays = Math.round((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

    if (Math.abs(diffDays) < 1) return 'hoy'
    if (Math.abs(diffDays) < 30) return rtf.format(diffDays, 'day')
    return new Intl.DateTimeFormat('es-AR', {
        month: 'short',
        day: 'numeric'
    }).format(date)
}

// ─── Componente Principal ───────────────────────────────────────────────────
export default async function BandejaOperativaPage() {
    const session = await auth()

    // Auth Guard
    if (!session) {
        redirect('/login')
    }

    let requests: any[] = []

    try {
        const rawRows = await getRequests()

        // Post-procesamiento SSR
        requests = rawRows.map((row: any) => ({
            ...row,
            slaStatus: calculateSlaStatus(row.dueAt, row.status as string),
            relativeDate: formatRelativeDate(row.createdAt)
        }))
    } catch (e: any) {
        console.error("Error fetching requests:", e)
    }

    // Calcular Métricas Agregadas 
    const totalOpen = requests.filter(r => ['open', 'in_progress', 'pending'].includes(r.status as string)).length
    const totalOverdue = requests.filter(r => r.slaStatus === 'overdue').length
    const totalAtRisk = requests.filter(r => r.slaStatus === 'at_risk').length
    const avgResolutionHours = 24 // Mock (o requeriría join con audit log o columna resolved_at)

    const metrics = {
        totalOpen,
        totalOverdue,
        totalAtRisk,
        avgResolutionHours
    }

    return (
        <main className="h-full w-full bg-slate-50 relative overflow-hidden flex flex-col fade-in">
            <BandejaLayout requests={requests} metrics={metrics} />
        </main>
    )
}
