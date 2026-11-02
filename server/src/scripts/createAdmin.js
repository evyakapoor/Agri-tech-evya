import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';

const createAdmin = async () => {
  try {
    await connectDB();

    const email = process.env.ADMIN_EMAIL || 'admin@agritech.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const name = process.env.ADMIN_NAME || 'Chief Agronomist & System Admin';

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log(`[Admin Setup] Administrator with email "${email}" already exists (Role: ${existingAdmin.role}).`);
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log(`[Admin Setup] Promoted user "${email}" to administrator role.`);
      }
    } else {
      const admin = await User.create({
        name,
        email,
        password,
        phone: '+91 98765 43210',
        role: 'admin',
        preferredLanguage: 'en',
        location: {
          address: 'Agricultural Research Station, Sector 4',
          district: 'New Delhi',
          state: 'Delhi',
          country: 'India',
        },
      });
      console.log(`[Admin Setup] Initial administrator created successfully!`);
      console.log(`Email:    ${admin.email}`);
      console.log(`Password: ${password}`);
      console.log(`Role:     ${admin.role}`);
    }

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error(`[Admin Setup] Error: ${err.message}`);
    await disconnectDB();
    process.exit(1);
  }
};

createAdmin();
