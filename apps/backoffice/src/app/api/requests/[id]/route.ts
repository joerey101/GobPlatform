import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { fetchRequestDetail } from '@/lib/queries/request-detail'

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const resolvedParams = await params
        const { id } = resolvedParams

        if (!id) {
            return NextResponse.json({ error: 'Missing request ID' }, { status: 400 })
        }

        const detail = await fetchRequestDetail(id)

        if (!detail) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 })
        }

        return NextResponse.json(detail)
    } catch (error: any) {
        console.error('Request detail fetch error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
