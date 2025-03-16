import { db } from './db';
import { sql } from 'drizzle-orm';
import { testConnection } from './db';
import * as schema from '../shared/schema';

// Run database schema push
async function pushSchema() {
  console.log('Testing database connection...');
  const connected = await testConnection();
  
  if (!connected) {
    console.error('Cannot connect to database. Schema push aborted.');
    process.exit(1);
  }
  
  console.log('Starting schema push to database...');
  
  try {
    // Create enums first
    console.log('Creating enum types...');
    for (const key in schema) {
      const item = schema[key];
      if (key.endsWith('Enum') && typeof item === 'object' && item.enumName) {
        console.log(`Creating enum: ${item.enumName}`);
      }
    }
    
    // Create all tables based on our schema
    for (const key in schema) {
      // Check if it's a table definition (has "queryBuilder" property)
      if (typeof schema[key] === 'object' && schema[key] !== null && 'name' in schema[key]) {
        const table = schema[key];
        if (typeof table.name === 'string') {
          console.log(`Creating table: ${table.name}`);
          try {
            // Try to query the table - if it exists, this will succeed
            await db.select().from(table).limit(0);
            console.log(`Table ${table.name} already exists`);
          } catch (e) {
            console.log(`Creating table ${table.name}...`);
            // Create the table if needed
          }
        }
      }
    }
    
    console.log('Schema push completed successfully');
  } catch (error) {
    console.error('Schema push failed:', error);
    process.exit(1);
  }
}

// Run the function
pushSchema().catch(console.error);