'use client'

import { useRouter } from 'next/navigation'
import React from 'react'

export function TableRow({ id, children }: { id: string; children: React.ReactNode }) {
    const router = useRouter()

    return (
        <tr
            onClick={() => router.push(`/bandeja/${id}`)}
            className="cursor-pointer transition-colors hover:bg-slate-50"
        >
            {children}
        </tr>
    )
}
