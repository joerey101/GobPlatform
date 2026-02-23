import { eq, and } from 'drizzle-orm'
import { db } from '../client'
import { internalUser, userRole, role } from '../schema/index'

/**
 * Obtiene un usuario interno por email, junto con sus roles asignados.
 * Usado por NextAuth credentials provider en backoffice.
 */
export async function getUserByEmail(email: string) {
    const rows = await db
        .select({
            id: internalUser.id,
            email: internalUser.email,
            fullName: internalUser.fullName,
            passwordHash: internalUser.passwordHash,
            orgUnitId: internalUser.orgUnitId,
            isActive: internalUser.isActive,
            roleName: role.name,
        })
        .from(internalUser)
        .leftJoin(
            userRole,
            and(eq(userRole.userId, internalUser.id), eq(userRole.isActive, true))
        )
        .leftJoin(role, eq(role.id, userRole.roleId))
        .where(eq(internalUser.email, email))

    if (rows.length === 0) return null

    const first = rows[0]!
    return {
        id: first.id,
        email: first.email,
        fullName: first.fullName,
        passwordHash: first.passwordHash,
        orgUnitId: first.orgUnitId,
        isActive: first.isActive,
        roles: rows.flatMap((r) => (r.roleName !== null ? [r.roleName] : [])),
    }
}

export type UserWithRoles = NonNullable<Awaited<ReturnType<typeof getUserByEmail>>>
