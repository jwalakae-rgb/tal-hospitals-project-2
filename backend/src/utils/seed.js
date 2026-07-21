/**
 * Seed script — populates the database with demo data.
 * Run with: npm run seed
 */
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');

const seed = async () => {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Patient.deleteMany({}),
    Doctor.deleteMany({}),
    Department.deleteMany({}),
    Appointment.deleteMany({}),
  ]);

  console.log('Creating departments...');
  const departments = await Department.insertMany([
    { name: 'Cardiology', description: 'Heart and cardiovascular care' },
    { name: 'Orthopedics', description: 'Bone, joint, and muscle care' },
    { name: 'Pediatrics', description: 'Child healthcare' },
    { name: 'Dermatology', description: 'Skin care' },
    { name: 'General Medicine', description: 'General health consultations' },
  ]);

  console.log('Creating admin user...');
  const admin = await User.create({
    name: 'System Admin',
    email: 'admin@talhospitals.com',
    password: 'Admin@1234',
    role: 'admin',
    phone: '9999999999',
  });

  console.log('Creating doctors...');
  const doctorSeeds = [
    { name: 'Dr. Aditi Sharma', email: 'aditi.sharma@talhospitals.com', dept: 'Cardiology', spec: 'Cardiologist', exp: 12, fee: 800 },
    { name: 'Dr. Rohan Mehta', email: 'rohan.mehta@talhospitals.com', dept: 'Orthopedics', spec: 'Orthopedic Surgeon', exp: 9, fee: 700 },
    { name: 'Dr. Kavya Nair', email: 'kavya.nair@talhospitals.com', dept: 'Pediatrics', spec: 'Pediatrician', exp: 7, fee: 500 },
    { name: 'Dr. Sameer Khan', email: 'sameer.khan@talhospitals.com', dept: 'Dermatology', spec: 'Dermatologist', exp: 5, fee: 600 },
    { name: 'Dr. Priya Iyer', email: 'priya.iyer@talhospitals.com', dept: 'General Medicine', spec: 'General Physician', exp: 15, fee: 400 },
  ];

  const doctors = [];
  for (const d of doctorSeeds) {
    const dept = departments.find((dep) => dep.name === d.dept);
    const user = await User.create({
      name: d.name,
      email: d.email,
      password: 'Doctor@1234',
      role: 'doctor',
      phone: '9800000000',
    });
    const doctor = await Doctor.create({
      user: user._id,
      department: dept._id,
      specialization: d.spec,
      experience: d.exp,
      consultationFee: d.fee,
      availability: [
        { day: 'Monday', startTime: '09:00', endTime: '13:00' },
        { day: 'Wednesday', startTime: '09:00', endTime: '13:00' },
        { day: 'Friday', startTime: '14:00', endTime: '18:00' },
      ],
    });
    doctors.push(doctor);
  }

  console.log('Creating patients...');
  const patientSeeds = [
    { name: 'Arjun Verma', email: 'arjun.verma@example.com', city: 'Kochi', age: 34, gender: 'male' },
    { name: 'Sneha Reddy', email: 'sneha.reddy@example.com', city: 'Bengaluru', age: 28, gender: 'female' },
    { name: 'Vikram Singh', email: 'vikram.singh@example.com', city: 'Kochi', age: 45, gender: 'male' },
  ];

  const patients = [];
  for (const p of patientSeeds) {
    const user = await User.create({
      name: p.name,
      email: p.email,
      password: 'Patient@1234',
      role: 'patient',
      phone: '9700000000',
    });
    const patient = await Patient.create({
      user: user._id,
      city: p.city,
      age: p.age,
      gender: p.gender,
    });
    patients.push(patient);
  }

  console.log('Creating sample appointments...');
  await Appointment.create({
    patient: patients[0]._id,
    doctor: doctors[0]._id,
    department: doctors[0].department,
    appointmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    timeSlot: '09:00-09:30',
    consultationType: 'in-person',
    status: 'pending',
    reasonForVisit: 'Routine heart checkup',
    consultationFee: doctors[0].consultationFee,
  });

  console.log('\n✅ Seed complete!\n');
  console.log('Login credentials:');
  console.log('  Admin:   admin@talhospitals.com / Admin@1234');
  console.log('  Doctor:  aditi.sharma@talhospitals.com / Doctor@1234');
  console.log('  Patient: arjun.verma@example.com / Patient@1234\n');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
