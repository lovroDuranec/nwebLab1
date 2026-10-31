import { Pool } from 'pg'
import dotenv from 'dotenv'
dotenv.config()

let DATABASE_NAME = process.env.DATABASE_NAME;
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: DATABASE_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
    ssl: true
})


export async function getComments() {
    const comments: string[] = [];
    const results = await pool.query('SELECT id, comment from comments');
    results.rows.forEach(r => comments.push(r.comment));
    return comments;
}