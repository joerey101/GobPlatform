import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'
import path from 'path'

// Load env from the db package itself or from apps
dotenv.config({ path: path.resolve(__dirname, '../../apps/backoffice/.env.local') })
dotenv.config({ path: path.resolve(__dirname, '.env.local') })

export default defineConfig({
    schema: './src/schema/index.ts',
    out: '../../infra/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env['DATABASE_URL']!,
    },
    verbose: true,
    strict: true,
})
