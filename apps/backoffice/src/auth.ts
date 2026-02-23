import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { getUserByEmail } from '@repo/db'
import { authConfig } from './auth.config'

const credentialsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            name: 'Credenciales',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Contraseña', type: 'password' },
            },
            async authorize(credentials) {
                const parsed = credentialsSchema.safeParse(credentials)
                if (!parsed.success) return null

                const user = await getUserByEmail(parsed.data.email)
                if (!user || !user.isActive) return null

                const passwordMatch = await bcrypt.compare(parsed.data.password, user.passwordHash)
                if (!passwordMatch) return null

                return {
                    id: user.id,
                    email: user.email,
                    name: user.fullName,
                    orgUnitId: user.orgUnitId,
                    roles: user.roles,
                }
            },
        }),
    ],
})
