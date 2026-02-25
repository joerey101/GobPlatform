import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { getCitizenAuthByCuil } from '@repo/db'
import { authConfig } from './auth.config'

const credentialsSchema = z.object({
    cuil: z.string().min(11).max(11),
    password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            name: 'Ciudadano',
            credentials: {
                cuil: { label: 'CUIL/CUIT', type: 'text' },
                password: { label: 'Contraseña', type: 'password' },
            },
            async authorize(credentials) {
                const parsed = credentialsSchema.safeParse(credentials)
                if (!parsed.success) return null

                const citizen = await getCitizenAuthByCuil(parsed.data.cuil)
                if (!citizen) return null

                const passwordMatch = await bcrypt.compare(parsed.data.password, citizen.passwordHash)
                if (!passwordMatch) return null

                return {
                    id: citizen.citizenId,
                    name: citizen.fullName,
                    cuil: citizen.cuil,
                }
            },
        }),
    ],
})
