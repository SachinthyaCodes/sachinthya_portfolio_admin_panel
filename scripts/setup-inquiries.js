const fs = require('fs');
const path = require('path');

console.log('\n🔧 Inquiries Table Setup');
console.log('========================\n');

const migrationPath = path.join(__dirname, '..', 'database', 'inquiries-migration.sql');

if (!fs.existsSync(migrationPath)) {
  console.error('❌ Migration file not found:', migrationPath);
  process.exit(1);
}

const migration = fs.readFileSync(migrationPath, 'utf8');

console.log('📋 Migration SQL ready to execute:\n');
console.log('This migration will:');
console.log('  ✓ Create the "inquiries" table');
console.log('  ✓ Set up indexes for performance');
console.log('  ✓ Enable Row Level Security (RLS)');
console.log('  ✓ Create policies for public insert & authenticated read/update/delete');
console.log('  ✓ Add automatic timestamp updates');

console.log('\n📝 To execute this migration:');
console.log('   1. Go to your Supabase project dashboard');
console.log('   2. Navigate to SQL Editor');
console.log('   3. Copy and paste the content from:');
console.log(`      ${migrationPath}`);
console.log('   4. Click "Run" to execute\n');

console.log('✨ After running the migration, your contact form will be fully functional!\n');
