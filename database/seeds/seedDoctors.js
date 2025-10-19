require('dotenv').config({ path: '../../backend/.env' });
const mongoose = require('mongoose');
const User = require('../../backend/src/models/User');
const Doctor = require('../../backend/src/models/Doctor');
const connectDB = require('../../backend/src/config/db');
const logger = require('../../backend/src/utils/logger');

const doctorsData = [
  {
    email: 'dr.smith@neurona.com',
    phone: '9876543220',
    password: 'Doctor@123',
    name: 'Dr. Sarah Smith',
    specialty: 'psychiatrist',
    experience: 15,
    fee: 1500,
    qualification: 'MD Psychiatry, MBBS',
    registrationNumber: 'MCI-12345',
    bio: 'Experienced psychiatrist specializing in anxiety and depression disorders with 15 years of clinical practice.',
    languages: ['English', 'Hindi'],
    availability: {
      monday: ['10:00', '11:00', '14:00', '15:00', '16:00'],
      tuesday: ['10:00', '11:00', '14:00', '15:00', '16:00'],
      wednesday: ['10:00', '11:00', '14:00', '15:00'],
      thursday: ['10:00', '11:00', '14:00', '15:00', '16:00'],
      friday: ['10:00', '11:00', '14:00', '15:00'],
      saturday: ['10:00', '11:00'],
      sunday: []
    },
    education: [
      {
        degree: 'MD Psychiatry',
        institution: 'AIIMS Delhi',
        year: 2009
      },
      {
        degree: 'MBBS',
        institution: 'Delhi Medical College',
        year: 2005
      }
    ]
  },
  {
    email: 'dr.patel@neurona.com',
    phone: '9876543221',
    password: 'Doctor@123',
    name: 'Dr. Raj Patel',
    specialty: 'therapist',
    experience: 10,
    fee: 1200,
    qualification: 'M.Phil Clinical Psychology',
    registrationNumber: 'RCI-67890',
    bio: 'Clinical psychologist with expertise in CBT and family therapy. Specializes in stress management and relationship counseling.',
    languages: ['English', 'Hindi', 'Gujarati'],
    availability: {
      monday: ['11:00', '14:00', '15:00', '16:00'],
      tuesday: ['11:00', '14:00', '15:00', '16:00'],
      wednesday: ['11:00', '14:00', '15:00', '16:00'],
      thursday: ['11:00', '14:00', '15:00'],
      friday: ['11:00', '14:00', '15:00', '16:00'],
      saturday: ['10:00', '11:00', '14:00'],
      sunday: []
    },
    education: [
      {
        degree: 'M.Phil Clinical Psychology',
        institution: 'Delhi University',
        year: 2014
      },
      {
        degree: 'B.A Psychology',
        institution: 'Miranda House, Delhi University',
        year: 2012
      }
    ]
  },
  {
    email: 'dr.mehta@neurona.com',
    phone: '9876543222',
    password: 'Doctor@123',
    name: 'Dr. Priya Mehta',
    specialty: 'psychiatrist',
    experience: 12,
    fee: 1800,
    qualification: 'MD Psychiatry, DPM',
    registrationNumber: 'MCI-54321',
    bio: 'Specializing in mood disorders, stress management, and women mental health. Holistic approach to treatment.',
    languages: ['English', 'Hindi', 'Marathi'],
    availability: {
      monday: ['10:00', '11:00', '15:00', '16:00'],
      tuesday: ['10:00', '11:00', '15:00', '16:00'],
      wednesday: ['10:00', '11:00', '15:00', '16:00'],
      thursday: ['10:00', '11:00', '15:00', '16:00'],
      friday: ['10:00', '11:00', '15:00'],
      saturday: ['10:00', '11:00'],
      sunday: []
    },
    education: [
      {
        degree: 'MD Psychiatry',
        institution: 'KEM Hospital, Mumbai',
        year: 2012
      },
      {
        degree: 'DPM',
        institution: 'National Institute of Mental Health, Delhi',
        year: 2010
      }
    ]
  },
  {
    email: 'dr.verma@neurona.com',
    phone: '9876543223',
    password: 'Doctor@123',
    name: 'Dr. Arun Verma',
    specialty: 'counselor',
    experience: 8,
    fee: 1000,
    qualification: 'MA Counseling Psychology',
    registrationNumber: 'IACP-11111',
    bio: 'Trained counselor specializing in career counseling, life coaching, and personal development.',
    languages: ['English', 'Hindi', 'Punjabi'],
    availability: {
      monday: ['09:00', '10:00', '13:00', '14:00', '15:00'],
      tuesday: ['09:00', '10:00', '13:00', '14:00', '15:00'],
      wednesday: ['09:00', '10:00', '13:00', '14:00'],
      thursday: ['09:00', '10:00', '13:00', '14:00', '15:00'],
      friday: ['09:00', '10:00', '13:00', '14:00'],
      saturday: ['09:00', '10:00'],
      sunday: []
    },
    education: [
      {
        degree: 'MA Counseling Psychology',
        institution: 'Punjab University',
        year: 2016
      }
    ]
  }
];

const seedDoctors = async () => {
  try {
    await connectDB();
    
    console.log('\n🌱 Starting doctor seeding...');
    
    for (const docData of doctorsData) {
      const existingDoctor = await Doctor.findOne({ 
        registrationNumber: docData.registrationNumber 
      });
      
      if (!existingDoctor) {
        // Create user account
        const user = await User.create({
          email: docData.email,
          phone: docData.phone,
          password: docData.password,
          role: 'doctor',
          profile: {
            name: docData.name
          },
          isVerified: true
        });
        
        // Create doctor profile
        const doctor = await Doctor.create({
          userId: user._id,
          name: docData.name,
          specialty: docData.specialty,
          experience: docData.experience,
          fee: docData.fee,
          qualification: docData.qualification,
          registrationNumber: docData.registrationNumber,
          bio: docData.bio,
          languages: docData.languages,
          availability: docData.availability,
          education: docData.education,
          rating: 4.5 + Math.random() * 0.5,
          totalRatings: Math.floor(Math.random() * 50) + 20,
          isActive: true,
          isVerified: true
        });
        
        console.log(`✅ Created doctor: ${docData.name}`);
      } else {
        console.log(`⏭️  Doctor already exists: ${docData.name}`);
      }
    }
    
    console.log('\n✅ Doctor seeding completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding doctors:', error.message);
    process.exit(1);
  }
};

seedDoctors();