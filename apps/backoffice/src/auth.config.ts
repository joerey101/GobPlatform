import type { NextAuthConfig } from 'next-auth'
import type { JWT } from 'next-auth/jwt'

/**
 * Edge-compatible auth config.
 * NO imports of bcryptjs, pg, or any Node.js-only modules.
 * Used by middleware (Edge Runtime) and extended by auth.ts (Node.js).
 */
export const authConfig = {
    trustHost: true,
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt' as const,
        maxAge: 8 * 60 * 60, // 8 horas
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isAuthRoute = nextUrl.pathname.startsWith('/api/auth')
            const isDebugRoute = nextUrl.pathname.startsWith('/api/debug')
            const isLoginPage = nextUrl.pathname === '/login'

            if (isAuthRoute || isDebugRoute) return true
            if (isLoggedIn && isLoginPage) {
                return Response.redirect(new URL('/dashboard', nextUrl))
            }
            if (!isLoggedIn && !isLoginPage) {
                const loginUrl = new URL('/login', nextUrl)
                loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
                return Response.redirect(loginUrl)
            }
            return true
        },
        async jwt({ token, user }) {
            if (user) {
                token['userId'] = user.id
                token['orgUnitId'] = (user as any)['orgUnitId']
                token['roles'] = (user as any)['roles']
                token['fullName'] = user.name
            }
            return token as JWT
        },
        async session({ session, token }) {
            session.user.id = token['userId'] as string
                ; (session as any)['orgUnitId'] = token['orgUnitId']
                ; (session as any)['roles'] = token['roles']
                ; (session as any)['fullName'] = token['fullName']
            return session
        },
    },
    providers: [], // Providers van en auth.ts (Node.js runtime)
} satisfies NextAuthConfig
