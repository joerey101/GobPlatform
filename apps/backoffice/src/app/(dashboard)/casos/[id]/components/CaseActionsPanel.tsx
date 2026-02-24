'use client'

import { useState } from 'react'
import { updateRequestStatus, assignRequest, createWorkItem } from '@/lib/actions/case-actions'

export function CaseActionsPanel({ requestId, currentStatus, orgUnits, users }: { requestId: string, currentStatus: string, orgUnits: any[], users: any[] }) {
    const [statusLoading, setStatusLoading] = useState(false)
    const [assignLoading, setAssignLoading] = useState(false)
    const [workLoading, setWorkLoading] = useState(false)

    // Handlers que delegan en Server Actions

    return (
        <div className="flex flex-col gap-6">

            {/* 1. Cambiar Estado */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Cambiar Estado</h3>
                <form action={async (formData) => {
                    setStatusLoading(true)
                    await updateRequestStatus(formData)
                    setStatusLoading(false)
                }} className="flex flex-col gap-3">
                    <input type="hidden" name="requestId" value={requestId} />
                    <select name="newStatus" defaultValue={currentStatus} className="p-2 border border-slate-200 rounded-lg text-sm appearance-none outline-none focus:ring-2 focus:ring-[#2c6bc3]/20 focus:border-[#2c6bc3] bg-slate-50">
                        <option value="pending">Pendiente</option>
                        <option value="in_progress">En Progreso</option>
                        <option value="waiting_citizen">Esperando al Ciudadano</option>
                        <option value="waiting_internal">Esperando Interno</option>
                        <option value="resolved">Resuelto</option>
                        <option value="closed">Cerrado</option>
                        <option value="cancelled">Cancelado</option>
                        <option value="on_hold">En Pausa</option>
                    </select>
                    <button disabled={statusLoading} type="submit" className="w-full bg-[#2c6bc3] text-white p-2 rounded-lg text-sm font-medium hover:bg-[#1A4B8F] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                        {statusLoading ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : <span className="material-symbols-outlined text-sm">save</span>}
                        Actualizar
                    </button>
                </form>
            </div>

            {/* 2. Derivar Organismo */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Derivar Caso</h3>
                <form action={async (formData) => {
                    setAssignLoading(true)
                    await assignRequest(formData)
                    setAssignLoading(false)
                }} className="flex flex-col gap-3">
                    <input type="hidden" name="requestId" value={requestId} />
                    <select name="toOrgUnitId" required className="p-2 border border-slate-200 rounded-lg text-sm appearance-none outline-none focus:ring-2 focus:border-[#2c6bc3] bg-slate-50">
                        <option value="">Seleccionar organismo...</option>
                        {orgUnits.map(org => (
                            <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                    </select>
                    <textarea name="note" placeholder="Nota de derivación (opcional)" className="p-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:border-[#2c6bc3] bg-slate-50 resize-none h-20" />
                    <button disabled={assignLoading} type="submit" className="w-full border border-[#2c6bc3] text-[#2c6bc3] p-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors disabled:opacity-50">
                        Derivar
                    </button>
                </form>
            </div>

            {/* 3. Nueva Tarea Operativa */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Nueva Tarea (Workflow)</h3>
                <form action={async (formData) => {
                    setWorkLoading(true)
                    await createWorkItem(formData)
                    // @ts-ignore
                    document.getElementById('taskForm')?.reset()
                    setWorkLoading(false)
                }} id="taskForm" className="flex flex-col gap-3">
                    <input type="hidden" name="requestId" value={requestId} />
                    <input type="text" name="title" required placeholder="Nombre de la tarea" className="p-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:border-[#2c6bc3] bg-slate-50" />
                    <select name="assignedUserId" className="p-2 border border-slate-200 rounded-lg text-sm appearance-none outline-none focus:ring-2 focus:border-[#2c6bc3] bg-slate-50">
                        <option value="">Asignar a operador (opcional)...</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.fullName}</option>
                        ))}
                    </select>
                    <input type="date" name="dueAt" className="p-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:border-[#2c6bc3] bg-slate-50" />
                    <button disabled={workLoading} type="submit" className="w-full bg-slate-800 text-white p-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">add_task</span>
                        Crear Tarea
                    </button>
                </form>
            </div>

        </div>
    )
}
