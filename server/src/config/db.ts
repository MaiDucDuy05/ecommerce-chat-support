import { MongoClient } from "mongodb";


const client = new MongoClient(process.env.MONGODB_ATLAS_URI  as string, {
  tls: true,
});

export async function connectDB() {
  await client.connect();
  await client.db("admin").command({ ping: 1 });

  
  console.log("✅ Connected to MongoDB Atlas!");
}

export { client };