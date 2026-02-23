import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

/**
 * Middleware uses only the edge-compatible authConfig.
 * No bcryptjs or pg imports — safe for Edge Runtime.
 */
export const { auth: middleware } = NextAuth(authConfig)

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
