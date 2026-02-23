import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
    const { nextUrl, auth: session } = req
    const isLoggedIn = !!session
    const isAuthRoute = nextUrl.pathname.startsWith('/api/auth')
    const isLoginPage = nextUrl.pathname === '/login'

    // Siempre permitir rutas de NextAuth
    if (isAuthRoute) return NextResponse.next()

    // Si está logueado y quiere ir al login → al dashboard
    if (isLoggedIn && isLoginPage) {
        return NextResponse.redirect(new URL('/', nextUrl))
    }

    // Si NO está logueado y quiere ir a cualquier ruta protegida → al login
    if (!isLoggedIn && !isLoginPage) {
        const loginUrl = new URL('/login', nextUrl)
        loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
})

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
