import { eq } from 'drizzle-orm'
import { db } from '../client'
import { internalUser, userRole, role } from '../schema/index'

/**
 * Obtiene un usuario interno por email, junto con sus roles asignados.
 * Usado por NextAuth credentials provider en backoffice.
 */
export async function getUserByEmail(email: string) {
    const user = await db.query.internalUser.findFirst({
        where: eq(internalUser.email, email),
        with: {
            roles: {
                where: eq(userRole.isActive, true),
                with: {
                    role: true,
                },
            },
        },
    })

    if (!user) return null

    return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        passwordHash: user.passwordHash,
        orgUnitId: user.orgUnitId,
        isActive: user.isActive,
        roles: user.roles.map((ur) => ur.role.name),
    }
}

export type UserWithRoles = NonNullable<Awaited<ReturnType<typeof getUserByEmail>>>
