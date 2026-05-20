const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');

require('dotenv').config();
app.use(cors());
const port = process.env.PORT || 8000;




// const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_URI;



// const uri = "mongodb://carnew:Zbl6jFNiqDJqwDIi@ac-rjzhhgu-shard-00-00.wiyy1ca.mongodb.net:27017,ac-rjzhhgu-shard-00-01.wiyy1ca.mongodb.net:27017,ac-rjzhhgu-shard-00-02.wiyy1ca.mongodb.net:27017/?ssl=true&replicaSet=atlas-kisohd-shard-0&authSource=admin&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    const db = client.db("all-cars");
    const carCollection = db.collection("cars");


    app.get('/cars', async(req, res) => {
      const cursor = carCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });


    app.get('/cars/:carid', async(req, res) => {
      const { carid } = req.params;
      const query = { _id: new ObjectId(carid) };
      const result = await carCollection.findOne(query);
      res.send(result);
      
    });



    // add git file add 

  








    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);













app.get('/', (req, res) => {
  res.send('Hello World thi si sever side ror car!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});