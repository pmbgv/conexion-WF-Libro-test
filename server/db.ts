import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// When running in NeonDB environment, we need to use websockets
neonConfig.webSocketConstructor = ws;

// Check for DATABASE_URL environment variable
if (!process.env.DATABASE_URL) {
  console.warn(
    "DATABASE_URL is not set. Using in-memory storage instead. To use a database, create a Postgres database in your Replit settings."
  );
}

// Create a database pool if we have a DATABASE_URL
export const pool = process.env.DATABASE_URL 
  ? new Pool({ connectionString: process.env.DATABASE_URL }) 
  : null;

// Create database client if pool exists
export const db = pool 
  ? drizzle({ client: pool, schema }) 
  : null;

// Database connection check function
export async function checkDatabase(): Promise<boolean> {
  if (!pool) return false;
  
  try {
    const result = await pool.query('SELECT NOW()');
    return result.rowCount > 0;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}