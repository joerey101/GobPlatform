const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../apps/backoffice/.env.local') });

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // 1. Get citizens and their CUILs
        // We know from seed.ts that CUIL is stored in citizen_identifier table
        const res = await client.query(`
            SELECT c.id, ci.number as cuil
            FROM citizen c
            JOIN citizen_identifier ci ON c.id = ci.citizen_id
            WHERE ci.type = 'cuil'
            LIMIT 16
        `);

        if (res.rows.length === 0) {
            console.log('No citizens with CUIL found. Please run the original seed first or check the database.');
            return;
        }

        console.log(`Found ${res.rows.length} citizens. Seeding auth...`);

        const passwordHash = await bcrypt.hash('Vecino2024!', 12);

        for (const row of res.rows) {
            await client.query(`
                INSERT INTO citizen_auth (citizen_id, cuil, password_hash, updated_at)
                VALUES ($1, $2, $3, NOW())
                ON CONFLICT (citizen_id) DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = NOW()
            `, [row.id, row.cuil, passwordHash]);
            console.log(`  Seeded auth for CUIL: ${row.cuil}`);
        }

        console.log('Seed completed successfully!');
    } catch (err) {
        console.error('Error seeding auth:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
