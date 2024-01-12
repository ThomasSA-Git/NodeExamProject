import { MongoClient, ServerApiVersion } from "mongodb";
import "dotenv/config";

const url = `mongodb+srv://ThomasKEA:${process.env.MONGO_PASSWORD}@projectmanager.t0hnj3x.mongodb.net/`;

const client = new MongoClient(url, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const dbName = "ProjectManager";
const db = await client.db(dbName);

async function run() {
  try {
    await client.connect();
  } finally {
    // maybe not needed
    // await client.close();
  }
}
run().catch(console.dir);

export default {
  users: db.collection("users"),
  tokens: db.collection("tokens"),
  projects: db.collection("projects")
};