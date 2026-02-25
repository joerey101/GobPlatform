import type { NextAuthConfig } from 'next-auth'
import type { JWT } from 'next-auth/jwt'

/**
 * Edge-compatible auth config for Portal Vecinal.
 */
export const authConfig = {
    trustHost: true,
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt' as const,
        maxAge: 4 * 60 * 60, // 4 horas
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isAuthRoute = nextUrl.pathname.startsWith('/api/auth')
            const isPublicRoute = nextUrl.pathname === '/login' || nextUrl.pathname.startsWith('/public')

            if (isAuthRoute) return true

            if (isLoggedIn && isPublicRoute) {
                return Response.redirect(new URL('/dashboard', nextUrl))
            }

            if (!isLoggedIn && !isPublicRoute) {
                const loginUrl = new URL('/login', nextUrl)
                loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
                return Response.redirect(loginUrl)
            }

            return true
        },
        async jwt({ token, user }) {
            if (user) {
                token['citizenId'] = user.id
                token['cuil'] = (user as any)['cuil']
                token['fullName'] = user.name
            }
            return token as JWT
        },
        async session({ session, token }) {
            session.user.id = token['citizenId'] as string
                ; (session as any)['cuil'] = token['cuil']
                ; (session as any)['fullName'] = token['fullName']
            return session
        },
    },
    providers: [], // Providers defined in auth.ts
} satisfies NextAuthConfig
