import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  await client.connect();
  const db = client.db("aptitude_app");
  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { db } = await connectToDatabase();
    const questionsCollection = db.collection("questions");
    
    // Count total questions in DB
    const total = await questionsCollection.countDocuments({});
    
    // Shuffling order is handled client-side via shuffleArray().
    // Here we just confirm success and return total count.
    res.status(200).json({ success: true, totalShuffled: total });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
