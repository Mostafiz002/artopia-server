const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@web.8viqnbz.mongodb.net/?appName=web`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Artopia server is running");
});

async function run() {
  try {
    await client.connect();

    const db = client.db("artopia_db");
    const artsCollection = db.collection("artwork");

    //featured arts
    app.get("/artworks/featured", async (req, res) => {
      const cursor = artsCollection
        .find({ visibility: "public" })
        .sort({ created_at: -1 })
        .limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    //get all public artworks
    app.get("/artworks", async (req, res) => {
      const email = req.query.email;
      const query = { visibility: "public" };
      if (email) {
        query.artistEmail = email;
      }
      const cursor = artsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //add to db
    app.post("/artworks", async (req, res) => {
      const newArt = req.body;
      const result = await artsCollection.insertOne(newArt);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("Artopia server is running on port", port);
});
