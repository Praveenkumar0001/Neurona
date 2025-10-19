require('dotenv').config({ path: '../../backend/.env' });
const mongoose = require('mongoose');
const User = require('../../backend/src/models/User');
const connectDB = require('../../backend/src/config/db');
const logger = require('../../backend/src/utils/logger');

const usersData = [
  {
    email: 'patient1@neurona.com',
    phone: '9876543210',
    password: 'Patient@123',
    role: 'patient',
    profile: {
      name: 'Rajesh Kumar',
      age: 28,
      gender: 'male',
      city: 'Mumbai',
      state: 'Maharashtra'
    }
  },
  {
    email: 'patient2@neurona.com',
    phone: '9876543211',
    password: 'Patient@123',
    role: 'patient',
    profile: {
      name: 'Priya Singh',
      age: 32,
      gender: 'female',
      city: 'Delhi',
      state: 'Delhi'
    }
  },
  {
    email: 'patient3@neurona.com',
    phone: '9876543212',
    password: 'Patient@123',
    role: 'patient',
    profile: {
      name: 'Amit Patel',
      age: 25,
      gender: 'male',
      city: 'Bangalore',
      state: 'Karnataka'
    }
  }
];

const seedUsers = async () => {
  try {
    await connectDB();
    
    console.log('\n🌱 Starting user seeding...');
    
    for (const userData of usersData) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (!existingUser) {
        await User.create(userData);
        console.log(`✅ Created user: ${userData.profile.name}`);
      } else {
        console.log(`⏭️  User already exists: ${userData.profile.name}`);
      }
    }
    
    console.log('\n✅ User seeding completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding users:', error.message);
    process.exit(1);
  }
};

seedUsers();