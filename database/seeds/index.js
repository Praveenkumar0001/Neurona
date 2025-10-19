require('dotenv').config({ path: '../../backend/.env' });
const { execSync } = require('child_process');
const path = require('path');

const seedAll = async () => {
  console.log(`
╔═══════════════════════════════════════╗
║                                       ║
║   🚀 Starting Database Seeding...    ║
║                                       ║
╚═══════════════════════════════════════╝
  `);
  
  try {
    // Seed users first
    console.log('\n📝 Step 1: Seeding users...');
    execSync('node seedUsers.js', { 
      cwd: __dirname,
      stdio: 'inherit' 
    });
    
    // Then seed doctors
    console.log('\n👨‍⚕️ Step 2: Seeding doctors...');
    execSync('node seedDoctors.js', { 
      cwd: __dirname,
      stdio: 'inherit' 
    });
    
    console.log(`
╔═══════════════════════════════════════╗
║                                       ║
║   ✅ Seeding Completed Successfully! ║
║                                       ║
║   Ready to start development server   ║
║                                       ║
╚═══════════════════════════════════════╝
    `);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedAll();