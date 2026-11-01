import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DB_URL) {
    throw new Error('nije dobar url');
}
export const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
    ssl: {rejectUnauthorized: false}
})



export async function initializeDatabase() {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS passes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            document VARCHAR(255) NOT NULL,
            issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                CHECK (status IN ('ACTIVE', 'CANCELLED'))
        );
    `);

    console.log('baza je dobra');
}

export async function getStatistics(){
    const info = await pool.query(`
        SELECT COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'ACTIVE') AS active
        FROM passes 
    `);
    return {
        total : Number(info.rows[0].total),
        active : Number(info.rows[0].active)
    };
}

export async function deletePass(id: string){
    await pool.query(`
        DELETE FROM passes WHERE id = $1
    `, [id]);
}
export async function cancelPass(id: string){
    await pool.query(`
        UPDATE passes
        SET status = 'CANCELLED' WHERE id = $1
    `, [id]);
}
export async function getPassFor(name: string){
    await pool.query(`
        SELECT id, name, document, issued_at, status FROM passes WHERE name = $1
    `, [name]);
}
export async function generateRandomPass(){
    //samo za testiranje, radi s testim userom luka.lukic@gmail.com
    const name = 'luka.lukic@gmail.com'
    const document = 'dokuemnt-' + Math.floor(Math.random() * 10000000);
    const status = Math.random() > 0.5 ? 'ACTIVE' : 'CANCELLED';
    await pool.query(`
        INSERT into passes (name, document, status) VALUES ($1, $2, $3)
    `, [name,document,status]);
}