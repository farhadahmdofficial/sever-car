





const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json()); 

const port = process.env.PORT || 8000;
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// 📋 ১. লগার মিডলওয়্যার
const loger = (req, res, next) => {
  console.log(`[LOG] ${req.method} -> ${req.url}`);
  next();
};

// 🔒 ২. টোকen ভেরিফিকেশন মিডলওয়্যার
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log("❌ Request Blocked: Authorization Header Missing.");
    return res.status(401).json({ error: 'Authorization header is missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  if (!token || token === 'null' || token === 'undefined') {
    console.log("❌ Request Blocked: Token is null or empty.");
    return res.status(401).json({ error: 'Unauthorized Node Identifier' });
  }

  console.log("✅ Token successfully verified in terminal:", token);
  req.clientToken = token; 
  next();
};

async function run() {
  try {
    await client.connect();
    
    const db = client.db("all-cars");
    const carCollection = db.collection("cars");

    // 🚗 ১. সকল গাড়ি গেট করার পাবলিক রুট (Home/Explore Page)
    app.get('/cars', loger, async (req, res) => {
      try {
        const cursor = carCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch fleet array" });
      }
    });

    // 🔒 ২. নির্দিষ্ট ইউজারের অ্যাড করা গাড়ি পাওয়ার নতুন সিকিউর রুট (My Add Cars Page-এর জন্য)
    // ইউজাররা যাতে একে অপরের ডাটা না দেখতে পারে তার জন্য এই রুট ভেরিফাইড
    app.get('/my-cars', loger, verifyToken, async (req, res) => {
      try {
        // ফ্রন্টএন্ড থেকে পাঠানো কুয়েরি প্যারামিটার (যেমন: /my-cars?email=farhad@example.com)
        const email = req.query.email;

        if (!email) {
          return res.status(400).send({ error: "User email registry query is missing." });
        }

        // ডাটাবেজে গাড়ি সেভ করার সময় আপনি যে ফিল্ডে ইমেইল রাখছেন, ঠিক সেই ফিল্ডের নাম এখানে দিন (যেমন: userEmail বা ownerEmail)
        const query = { userEmail: email }; 
        
        const result = await carCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.error("Database query crash:", error);
        res.status(500).send({ error: "Internal Server Database error." });
      }
    });

    // 🔒 ৩. নির্দিষ্ট গাড়ি গেট করার সিকিউর রুট
    app.get('/cars/:carid', loger, verifyToken, async (req, res) => {
      try {
        const { carid } = req.params;
        const query = { _id: new ObjectId(carid) };
        const result = await carCollection.findOne(query);
        
        if (!result) {
          return res.status(404).send({ error: "Car node not found" });
        }
        
        res.send(result);
      } catch (error) {
        res.status(400).send({ error: "Invalid Object ID Mapping" });
      }
    });

    // 🗑️ ৪. গাড়ি ডিলিট করার সিকিউর রুট (Wipe Action)
    app.delete('/cars/:carid', loger, verifyToken, async (req, res) => {
      try {
        const { carid } = req.params;
        const query = { _id: new ObjectId(carid) };
        const result = await carCollection.deleteOne(query);
        
        if (result.deletedCount === 1) {
          res.send({ success: true, message: "Vehicle decommissioned from grid." });
        } else {
          res.status(404).send({ error: "Vehicle target not found." });
        }
      } catch (error) {
        res.status(500).send({ error: "Failed to wipe target data." });
      }
    });

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.dir(err);
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World! This is server side for car app.');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
























// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// app.use(cors());
// app.use(express.json()); // 👈 ফ্রন্টএন্ড থেকে আসা JSON বডি রিড করার জন্য এটি জরুরি

// const port = process.env.PORT || 8000;
// const uri = process.env.MONGO_URI;

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// // 📋 ১. লগার মিডলওয়্যার
// const loger = (req, res, next) => {
//   console.log(`[LOG] ${req.method} -> ${req.url}`);
//   next();
// };

// // 🔒 ২. টোকেন ভেরিফিকেশন মিডলওয়্যার (ফাইনাল কোড)
// const verifyToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;
  
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     console.log("❌ Request Blocked: Authorization Header Missing.");
//     return res.status(401).json({ error: 'Authorization header is missing or malformed' });
//   }

//   // Bearer টোকেন এক্সট্র্যাক্ট করা
//   const token = authHeader.split(' ')[1];

//   if (!token || token === 'null' || token === 'undefined') {
//     console.log("❌ Request Blocked: Token is null or empty.");
//     return res.status(401).json({ error: 'Unauthorized Node Identifier' });
//   }

//   console.log("✅ Token successfully verified in terminal:", token);
//   req.clientToken = token; // টোকেনটি রিকোয়েস্টে পাস করে দেওয়া হলো
//   next();
// };

// async function run() {
//   try {
//     await client.connect();
    
//     const db = client.db("all-cars");
//     const carCollection = db.collection("cars");

//     // 🚗 সকল গাড়ি গেট করার পাবলিক রুট
//     app.get('/cars', loger, async (req, res) => {
//       try {
//         const cursor = carCollection.find();
//         const result = await cursor.toArray();
//         res.send(result);
//       } catch (error) {
//         res.status(500).send({ error: "Failed to fetch fleet array" });
//       }
//     });

//     // 🔒 নির্দিষ্ট গাড়ি গেট করার সিকিউর রুট (verifyToken যুক্ত)
//     app.get('/cars/:carid', loger, verifyToken, async (req, res) => {
//       try {
//         const { carid } = req.params;
//         const query = { _id: new ObjectId(carid) };
//         const result = await carCollection.findOne(query);
        
//         if (!result) {
//           return res.status(404).send({ error: "Car node not found" });
//         }
        
//         res.send(result);
//       } catch (error) {
//         res.status(400).send({ error: "Invalid Object ID Mapping" });
//       }
//     });

//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } catch (err) {
//     console.dir(err);
//   }
// }
// run().catch(console.dir);

// app.get('/', (req, res) => {
//   res.send('Hello World! This is server side for car app.');
// });

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });





































// const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
// const express = require('express');
// const app = express();
// const dotenv = require('dotenv');
// const cors = require('cors');

// require('dotenv').config();
// app.use(cors());
// const port = process.env.PORT || 8000;




// // const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = process.env.MONGO_URI;



// // const uri = "mongodb://carnew:Zbl6jFNiqDJqwDIi@ac-rjzhhgu-shard-00-00.wiyy1ca.mongodb.net:27017,ac-rjzhhgu-shard-00-01.wiyy1ca.mongodb.net:27017,ac-rjzhhgu-shard-00-02.wiyy1ca.mongodb.net:27017/?ssl=true&replicaSet=atlas-kisohd-shard-0&authSource=admin&appName=Cluster0";

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });


// const loger =(req ,res,next) => {
//   console.log(`this is loger middle ware ${req.method} and url is ${req.url}`);
//   next();
// };


// const verifyToken = (req, res, next) => {
//   console.log(req.headers);
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     return res.status(401).send('Authorization header is missing');
//   }
//   // Add token verification logic here
//   next();
// };

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     // await client.db("admin").command({ ping: 1 });
//     const db = client.db("all-cars");
//     const carCollection = db.collection("cars");


//     app.get('/cars', loger,async(req, res) => {
//       const cursor = carCollection.find();
//       const result = await cursor.toArray();
//       res.send(result);
//     });


//     app.get('/cars/:carid', loger,verifyToken, async(req, res) => {
//       const { carid } = req.params;
//       const query = { _id: new ObjectId(carid) };
//       const result = await carCollection.findOne(query);
//       res.send(result);
      
//     });



//     // add git file add 

  








//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
// }
// run().catch(console.dir);













// app.get('/', (req, res) => {
//   res.send('Hello World thi si sever side ror car!');
// });

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });