import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'

import * as schema from './schema/index'

const connectionString = process.env['DATABASE_URL']

if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required')
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
})

export const db = drizzle(pool, { schema })

export type Database = typeof db
