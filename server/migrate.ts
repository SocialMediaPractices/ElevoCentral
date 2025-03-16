import { db } from './db';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { testConnection } from './db';

// Run the migration
async function runMigrations() {
  console.log('Testing database connection...');
  const connected = await testConnection();
  
  if (!connected) {
    console.error('Cannot connect to database. Migration aborted.');
    process.exit(1);
  }
  
  console.log('Starting schema migration...');
  
  try {
    // This will automatically create tables based on our schema
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('Schema migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the function
runMigrations().catch(console.error);