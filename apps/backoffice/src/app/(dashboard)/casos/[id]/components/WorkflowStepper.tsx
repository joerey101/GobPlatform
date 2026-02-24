import { Fragment } from 'react'
import { StatusBadge } from '@/components/ui/StatusBadge'

function formatDate(d: Date) {
    return new Intl.DateTimeFormat('es-AR', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(d))
}

export function WorkflowStepper({ workItems, currentStatus }: { workItems: any[], currentStatus: string }) {
    if (!workItems || workItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">account_tree</span>
                <p className="text-slate-500 text-sm">Aún no hay tareas creadas para este caso.</p>
            </div>
        )
    }

    return (
        <div className="relative pl-4 space-y-6 before:absolute before:inset-0 before:ml-[31px] before:w-0.5 before:bg-slate-200 before:z-0">
            {workItems.map((item, index) => {
                const isCompleted = item.status === 'done' || item.status === 'cancelled'
                const isCurrent = !isCompleted && index === workItems.findIndex(w => w.status !== 'done' && w.status !== 'cancelled')
                const isPending = !isCompleted && !isCurrent

                return (
                    <div key={item.id} className="relative flex items-start gap-4 z-10">
                        {/* Icon/Indicator */}
                        <div className="mt-0.5 shrink-0">
                            {isCompleted ? (
                                <div className="size-8 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
                                    <span className="material-symbols-outlined text-emerald-600 text-sm font-bold">check</span>
                                </div>
                            ) : isCurrent ? (
                                <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 relative">
                                    <span className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-50 animate-ping"></span>
                                    <div className="size-3 bg-blue-600 rounded-full"></div>
                                </div>
                            ) : (
                                <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-300">
                                    <div className="size-2.5 bg-slate-300 rounded-full"></div>
                                </div>
                            )}
                        </div>

                        {/* Content Card */}
                        <div className={`flex-1 p-4 rounded-xl border transition-colors ${isCurrent ? 'bg-blue-50/50 border-blue-200 shadow-sm' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <div>
                                    <h4 className={`text-sm font-bold ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                                        {item.title}
                                    </h4>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${item.status === 'done' ? 'bg-emerald-100 text-emerald-700' :
                                        item.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                                            item.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-slate-100 text-slate-500'
                                    }`}>
                                    {item.status.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[14px]">person</span>
                                    <span className="truncate">{item.assignedUserFullName || 'Sin asignar'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 justify-end">
                                    <span className="material-symbols-outlined text-[14px]">event</span>
                                    <span>{item.dueAt ? formatDate(item.dueAt) : 'Sin fecha límite'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
