import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    if (secret !== process.env.AUTH_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
        return NextResponse.json({ error: 'No DATABASE_URL' }, { status: 500 })
    }

    let pool;
    try {
        pool = new Pool({
            connectionString,
            ssl: { rejectUnauthorized: false },
        })

        const startTime = Date.now()
        const client = await pool.connect()
        const connectTime = Date.now() - startTime

        const result = await client.query('SELECT NOW()')
        client.release()
        await pool.end()

        return NextResponse.json({
            status: 'SUCCESS',
            connectTimeMs: connectTime,
            result: result.rows[0],
            connectionStringMasked: connectionString.replace(/:[^:@]+@/, ':***@')
        })
    } catch (error: any) {
        if (pool) await pool.end().catch(() => console.log('Error ending pool'));
        return NextResponse.json({
            status: 'CONNECTION_ERROR',
            message: error.message,
            code: error.code,
            connectionStringMasked: connectionString.replace(/:[^:@]+@/, ':***@')
        }, { status: 500 })
    }
}
