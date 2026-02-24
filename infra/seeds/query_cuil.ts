import { Pool } from 'pg'

async function main() {
    const pool = new Pool({
        connectionString: process.env['DATABASE_URL']!,
        ssl: { rejectUnauthorized: false },
    })

    const query = `
    SELECT type, COUNT(*) 
    FROM citizen_identifier 
    GROUP BY type;
    `

    const res = await pool.query(query)
    console.table(res.rows)
    await pool.end()
}

main().catch(console.error)
