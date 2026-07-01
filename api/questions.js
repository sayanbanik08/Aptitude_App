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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { db } = await connectToDatabase();
    const questionsCollection = db.collection("questions");
    const questions = await questionsCollection.find({}).toArray();
    
    const grouped = {};
    questions.forEach(q => {
      const { category, ...rest } = q;
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push({ ...rest, category }); 
    });
    
    res.status(200).json(grouped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
