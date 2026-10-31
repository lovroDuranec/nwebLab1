import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
    throw new Error('nije dobar url');
}


export async function initializeDatabase() {
    await pool.query(
        `   CREATE TABLE IF NOT EXISTS passes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            document VARCHAR(255) NOT NULL,
            issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                CHECK (status IN ('ACTIVE', 'CANCELLED'))
        );`
    );

    console.log('baza je dobra');
}