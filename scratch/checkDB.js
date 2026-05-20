import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

async function checkCollections() {
  const client = new MongoClient(process.env.MONGO_URI);
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    const users = await db.collection('users').find({}).toArray();
    console.log("Users in 'users' collection:", users.length);
    if (users.length > 0) {
      console.log("Example User Email:", users[0].email);
      console.log("Example Password:", users[0].password.substring(0, 10));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

checkCollections();
