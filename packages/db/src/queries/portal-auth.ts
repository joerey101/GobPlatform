import { eq } from 'drizzle-orm'
import { db } from '../client'
import { citizen, citizenAuth } from '../schema/index'

/**
 * Obtiene las credenciales de un ciudadano por su CUIL.
 * Incluye el nombre completo del ciudadano para la sesión.
 */
export async function getCitizenAuthByCuil(cuil: string) {
    const rows = await db
        .select({
            id: citizenAuth.id,
            citizenId: citizenAuth.citizenId,
            cuil: citizenAuth.cuil,
            passwordHash: citizenAuth.passwordHash,
            fullName: citizen.fullName,
        })
        .from(citizenAuth)
        .innerJoin(citizen, eq(citizen.id, citizenAuth.citizenId))
        .where(eq(citizenAuth.cuil, cuil))
        .limit(1)

    if (rows.length === 0) return null
    return rows[0]
}

export type CitizenAuthResult = NonNullable<Awaited<ReturnType<typeof getCitizenAuthByCuil>>>
