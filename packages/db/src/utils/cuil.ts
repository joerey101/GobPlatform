/**
 * Utility functions for validating and generating Argentine CUIL/CUIT identifiers.
 * The CUIL/CUIT is an 11-digit number with the format XX-XXXXXXXX-D where:
 * - XX is the prefix (usually 20, 23, 24, 27 for individuals, 30, 33, 34 for companies)
 * - XXXXXXXX is the DNI or society number
 * - D is a verifier digit calculated using a mod 11 algorithm
 */

export function calculateVerifierDigit(baseStr: string): number {
    if (baseStr.length !== 10) throw new Error('Base string must be exactly 10 digits')

    // Algoritmo módulo 11 de AFIP
    const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]

    let sum = 0
    for (let i = 0; i < 10; i++) {
        sum += parseInt(baseStr[i]!) * multipliers[i]!
    }

    const remainder = sum % 11

    if (remainder === 0) return 0
    if (remainder === 1) {
        // En caso de que sea 1, hay reglas especiales (generalmente cambia el prefijo),
        // pero para generación simplificada asumimos que el prefijo ya fue ajustado
        // o generamos un 9 como fallback.
        const isMale = baseStr.startsWith('20')
        const isFemale = baseStr.startsWith('27')

        if (isMale) return 9 // Prefijo debería cambiar a 23
        if (isFemale) return 4 // Prefijo debería cambiar a 23
        return 9
    }

    return 11 - remainder
}

/**
 * Validates a given CUIL/CUIT string
 * @param cuil The CUIL string to validate (can include hyphens)
 * @returns boolean indicating if it's a valid CUIL/CUIT
 */
export function validateCUIL(cuil: string): boolean {
    const cleanCuil = cuil.replace(/\D/g, '')

    // Debe tener exactamente 11 dígitos
    if (cleanCuil.length !== 11) return false

    const baseStr = cleanCuil.substring(0, 10)
    const providedVerifier = parseInt(cleanCuil[10]!)

    const expectedVerifier = calculateVerifierDigit(baseStr)

    // Regla especial para resto 1
    if (expectedVerifier === 9 && providedVerifier === 9 && baseStr.startsWith('23')) return true
    if (expectedVerifier === 4 && providedVerifier === 4 && baseStr.startsWith('23')) return true

    return providedVerifier === expectedVerifier
}

/**
 * Generates a valid CUIL for a given DNI and gender
 * @param dni The DNI number (8 digits, padded with leading zeros if shorter)
 * @param gender 'M' (Male) or 'F' (Female)
 * @returns A formatted valid CUIL string
 */
export function generateCUIL(dni: string, gender: 'M' | 'F' = 'M'): string {
    const paddedDNI = dni.padStart(8, '0')
    let prefix = gender === 'M' ? '20' : '27'
    let baseStr = `${prefix}${paddedDNI}`

    let verifier = calculateVerifierDigit(baseStr)

    // Handling the special mod 11 = 1 case
    if (verifier === 9 || verifier === 4) {
        prefix = '23'
        baseStr = `${prefix}${paddedDNI}`
        verifier = calculateVerifierDigit(baseStr)
    }

    return `${prefix}${paddedDNI}${verifier}`
}
