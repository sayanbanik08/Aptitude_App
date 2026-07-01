import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { MongoClient, ServerApiVersion } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const uri = process.env.MONGODB_URI

let db;
let questionsCollection;

// Establish MongoDB connection
async function connectDB() {
  if (!uri) {
    console.warn("WARNING: MONGODB_URI is not defined in .env file. The dev server won't be able to connect to the database.");
    return;
  }
  try {
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    await client.connect();
    db = client.db("aptitude_app");
    questionsCollection = db.collection("questions");
    console.log("Successfully connected to MongoDB Cloud from Vite!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'mongodb-api',
      configureServer(server) {
        connectDB(); // Only connect during dev server, not during build!
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/api/questions' && req.method === 'GET') {
            try {
              if (!questionsCollection) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: "Database not connected" }));
                return;
              }
              const questions = await questionsCollection.find({}).toArray();
              
              const grouped = {};
              questions.forEach(q => {
                const { category, ...rest } = q;
                if (!grouped[category]) grouped[category] = [];
                grouped[category].push({ ...rest, category }); 
              });
              
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(grouped));
            } catch (error) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: error.message }));
            }
          } else if (req.url === '/api/add-question' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                if (!questionsCollection) throw new Error("Database not connected");
                const { categoryKey, newQuestion } = JSON.parse(body);
                const questionToInsert = { ...newQuestion, category: categoryKey };
                
                await questionsCollection.insertOne(questionToInsert);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, inserted: questionToInsert }));
              } catch (error) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: error.message }));
              }
            });
          } else if (req.url === '/api/delete-question' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                if (!questionsCollection) throw new Error("Database not connected");
                const { categoryKey, questionId } = JSON.parse(body);
                
                await questionsCollection.deleteOne({ id: questionId, category: categoryKey });
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch (error) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: error.message }));
              }
            });
          } else {
            next();
          }
        });
      }
    }
  ],
})
