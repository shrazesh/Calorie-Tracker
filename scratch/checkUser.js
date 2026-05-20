import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../server/models/User.js';

dotenv.config({ path: './server/.env' });

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    const email = "ranjil@gmail.com";
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
    } else {
      console.log("User found:", user.email);
      console.log("Password hash starts with:", user.password.substring(0, 10));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkUser();
