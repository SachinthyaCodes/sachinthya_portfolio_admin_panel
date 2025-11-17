#!/usr/bin/env node

/**
 * Setup script to apply 2FA database migration
 * This script will add 2FA columns to the users table and create necessary tables
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  console.log('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Starting 2FA database migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'database', '2fa-migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📝 Executing migration SQL...');
    
    // Split SQL into individual statements and execute them
    const statements = migrationSQL
      .split(';')
      .filter(statement => statement.trim().length > 0)
      .map(statement => statement.trim() + ';');
    
    for (const statement of statements) {
      if (statement.trim() === ';') continue;
      
      console.log(`⏳ Executing: ${statement.substring(0, 50)}...`);
      
      const { error } = await supabase.rpc('exec_sql', {
        sql: statement
      });
      
      if (error) {
        // Try direct execution if RPC fails
        const { error: directError } = await supabase
          .from('_migration_temp')
          .select('*')
          .limit(0);
        
        // If we can't use RPC, we'll need to run the migration manually
        console.log('⚠️  Could not execute via RPC. Please run the migration SQL manually in your Supabase SQL editor.');
        console.log('📋 Copy the following SQL and run it in Supabase Dashboard > SQL Editor:');
        console.log('\n' + '='.repeat(80));
        console.log(migrationSQL);
        console.log('='.repeat(80) + '\n');
        return;
      }
      
      console.log('✅ Statement executed successfully');
    }
    
    console.log('✨ 2FA migration completed successfully!');
    console.log('\n🎯 Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Go to /dashboard/security to set up 2FA');
    console.log('3. Test the 2FA login flow');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n📋 Please run this SQL manually in Supabase Dashboard > SQL Editor:');
    console.log('\n' + '='.repeat(80));
    
    const migrationPath = path.join(__dirname, 'database', '2fa-migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log(migrationSQL);
    console.log('='.repeat(80) + '\n');
  }
}

// Check if the users table exists and has the right structure
async function checkDatabase() {
  console.log('🔍 Checking database structure...');
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('❌ Could not access users table:', error.message);
    console.log('Please make sure your users table exists and is properly configured.');
    return false;
  }
  
  console.log('✅ Users table is accessible');
  return true;
}

async function main() {
  const isValid = await checkDatabase();
  if (!isValid) return;
  
  await runMigration();
}

main().catch(console.error);