import { NextResponse } from 'next/server'
import { getUserByEmail } from '@repo/db'
import bcrypt from 'bcryptjs'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    const email = searchParams.get('email')
    const pass = searchParams.get('pass')

    if (secret !== process.env.AUTH_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!email || !pass) {
        return NextResponse.json({ error: 'Missing email or pass' }, { status: 400 })
    }

    try {
        const user = await getUserByEmail(email)

        if (!user) {
            return NextResponse.json({ status: 'USER_NOT_FOUND', email })
        }

        if (!user.isActive) {
            return NextResponse.json({ status: 'USER_INACTIVE', email })
        }

        const passwordMatch = await bcrypt.compare(pass, user.passwordHash)

        return NextResponse.json({
            status: 'USER_FOUND',
            email: user.email,
            roles: user.roles,
            passwordHashMatch: passwordMatch,
            hashLength: user.passwordHash.length
        })

    } catch (error: any) {
        return NextResponse.json({
            status: 'DB_ERROR',
            message: error.message,
            stack: error.stack
        }, { status: 500 })
    }
}
