const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../apps/backoffice/.env.local') });

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const sql = fs.readFileSync(path.resolve(__dirname, './migrations/0001_add_auth_and_ai.sql'), 'utf8');

        // Split by statement-breakpoint
        const statements = sql.split('--> statement-breakpoint');

        for (let statement of statements) {
            statement = statement.trim();
            if (statement) {
                try {
                    console.log(`Executing: ${statement.substring(0, 50)}...`);
                    await client.query(statement);
                } catch (e) {
                    if (e.code === '42710') { // duplicate_object (type already exists)
                        console.log('  Type already exists, skipping.');
                    } else if (e.code === '42P07') { // duplicate_table
                        console.log('  Table already exists, skipping.');
                    } else {
                        throw e;
                    }
                }
            }
        }
        console.log('Migration applied successfully!');
    } catch (err) {
        console.error('Error applying migration:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
