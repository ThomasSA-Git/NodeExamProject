import { MongoClient, ServerApiVersion } from "mongodb";

const url = "mongodb://localhost:27017/exam";
const client = new MongoClient(url, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const dbName = "exam";
const db = await client.db(dbName);

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB Compass");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

export default {
  users: db.collection("users"),
  tokens: db.collection("tokens"),
  projects: db.collection("projects")
};