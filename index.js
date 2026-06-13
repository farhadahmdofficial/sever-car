
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');

const app = express();

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 8000;
const uri = process.env.MONGO_URI;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


let db, carCollection, mybookingsCollection;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db("all-cars");
    carCollection = db.collection("cars");
    mybookingsCollection = db.collection("my-bookings");
    console.log("MongoDB Connected Successfully!");
  }
}

// মিডলওয়্যারসমূহ
const loger = (req, res, next) => {
  console.log(`[LOG] ${req.method} | ${req.url}`);
  next();
};

const verifyToken = async (req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const JWKS = createRemoteJWKSet(new URL(`${process.env.CLIENT_URL}/api/auth/jwks`));
    const { payload } = await jwtVerify(token, JWKS);
    req.user = payload;
  } catch (error) {
    console.error('Token validation failed:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// ------------------- 🚀 রুটসমূহ (ফাংশনের বাইরে, ওপেনলি থাকবে) -------------------

// হোম রুট
app.get('/', (req, res) => {
  res.send('fainla server is runing Hello World ok! 22');
});

// future data 4
app.get('/future', async (req, res) => {
  try {
    await connectDB(); // 💡 প্রতি রুটে ঢোকার সময় ডাটাবেজ কানেকশন নিশ্চিত করা
    const cars = carCollection.find().limit(4);
    const result = await cars.toArray();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in /future backend:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// all cars get 
app.get('/cars', async (req, res) => {
  try {
    await connectDB();
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        carName: { $regex: search, $options: "i" }
      };
    }
    const result = await carCollection.find(query).toArray();
    res.json(result);
  } catch (error) {
    console.error("Error in /cars search route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// single cars get 
app.get('/cars/:carid', loger, verifyToken, async (req, res) => {
  try {
    await connectDB();
    const { carid } = req.params;
    const query = { _id: new ObjectId(carid) };
    const result = await carCollection.findOne(query);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// post car
app.post("/cars", async (req, res) => {
  try {
    await connectDB();
    const data = req.body;
    const result = await carCollection.insertOne(data);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// my add cars show 
app.get('/my-cars', async (req, res) => {
  try {
    await connectDB();
    const email = req.query.email; 
    const query = { hrEmail: email }; 
    const result = await carCollection.find(query).toArray();
    res.status(200).json(result);
  } catch (error) {
    console.error("Backend filter failed:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// my add car delete 
app.delete('/cars/:id', async (req, res) => {
  try {
    await connectDB();
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }; 
    const result = await carCollection.deleteOne(query);
    res.status(200).json(result);
  } catch (error) {
    console.error("Delete operation failed:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// get booking 
app.get('/my-bookings', verifyToken, async (req, res) => {
  try {
    await connectDB();
    const userId = req.query.userId;
    if (!userId || userId === "undefined") {
      return res.status(400).json({ success: false, message: "User ID is required." });
    }
    const query = { userId: userId }; 
    const result = await mybookingsCollection.find(query).toArray();
    res.json(result);
  } catch (error) {
    console.error("Express /my-bookings GET Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// booking delete 
app.delete('/my-bookings/:id', async (req, res) => {
  try {
    await connectDB();
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await mybookingsCollection.deleteOne(query);
    if (result.deletedCount === 1) {
      res.send({ success: true, message: "Deleted successfully" });
    } else {
      res.send({ success: false, message: "Booking not found" });
    }
  } catch (error) {
    res.status(500).send({ success: false, message: "Server Error" });
  }
});

// patch route 
app.patch('/my-bookings/:carid', verifyToken, async (req, res) => {
  try {
    await connectDB();
    const { carid } = req.params;
    const mybookingsData = req.body;
    const car = await carCollection.findOne({ _id: new ObjectId(carid) });

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    await carCollection.updateOne({ _id: new ObjectId(carid) }, { 
      $inc: { mybookingscount: 1 },
      $set: { lastmybookings: new Date() },
    });

    const result = await mybookingsCollection.insertOne({
      ...mybookingsData,
      mybookingsAt: new Date(),
    });
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});


if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}


module.exports = app;





















// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// // const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const express = require('express');

// const cors = require ('cors');
// const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');
// // const dotenv = require('dotenv');
// // dotenv.config();

// const app = express();
// // add new 
// // let carCollection;
// // let mybookingsCollection;



// app.use(express.json());

// app.use(cors());
// const port = process.env.PORT || 8000;


// // mongdev code 



// // const uri = "mongodb+srv://<db_username>:<db_password>@cluster0.wiyy1ca.mongodb.net/?appName=Cluster0";
// const uri = process.env.MONGO_URI;


//   const JWKS = createRemoteJWKSet(
//       new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
//     )
//     // console.log(JWKS,"jaks one sss");


// // Create a MongoClient with a MongoClientOptions object to set the Stable API version

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// const loger =(req, res, next)=>{
//   console.log(`[LOG] ${req.method} | ${req.url}`);
//   next();
// };

// const verifyToken =async (req, res, next) => {
//   const{ authorization } = req.headers;
//   const token = authorization?.split(' ')[1];
//   // console.log(token);
//   if(!token){
//     return res.status(401).json({ message: 'Unauthorized' });
//   }



// try {
//     const JWKS = createRemoteJWKSet(
//      new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
//     )
//     const { payload } = await jwtVerify(token, JWKS)
//     req.user = payload;
//     // console.log(req.user,"user");

//     // console.log(payload,"payload from token");
//     // return payload
//   } catch (error) {
//     console.error('Token validation failed:', error)
//     return res.status(401).json({ message: 'Unauthorized' });
//   }


//   next();
// }

// // add new way fix
// // run().catch(console.dir);


// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
    

//     //  const db = client.db("all-cars");
//     //  carCollection = db.collection("cars");
//     //  mybookingsCollection = db.collection("my-bookings");


//      const db = client.db("all-cars");
//     const carCollection = db.collection("cars");
//     const mybookingsCollection = db.collection("my-bookings");



// // all cars get 

// app.get('/cars', async (req, res) => {
//   try {
//     const { search } = req.query;
//     let query = {};

    
//     if (search) {
//       query = {
//         carName: { 
//           $regex: search,     
//           $options: "i"       
//         }
//       };
//     }

  
//     const cursor = carCollection.find(query);
//     const result = await cursor.toArray();
    
  
//     res.json(result);

//   } catch (error) {
//     console.error("Error in /cars search route:", error);
//     res.status(500).json({ error: "Internal Server Error Matrix Breach" });
//   }
// });



// // post car

// app.post("/cars",async (req,res)=>{
//   const data =req.body;
//   const result =await carCollection.insertOne(data);
//   res.send(result);
//   // res.status(200).json(result);


// });



// // my add cars show 

// app.get('/my-cars', async (req, res) => {
//   try {
//     const email = req.query.email; 
    
    
//     const query = { hrEmail: email }; 
    
//     const result = await carCollection.find(query).toArray();
//     res.send(result);
//     // res.status(200).json(result);
//   } catch (error) {
//     console.error("Backend filter failed:", error);
//     res.status(500).send({ error: "Internal Server Error" });
//   }
// });

// ;



// // my add car delet 


// // const { ObjectId } = require('mongodb'); 

// app.delete('/cars/:id', async (req, res) => {
//   try {
//     const id = req.params.id;
    
  
//     const query = { _id: new ObjectId(id) }; 
    
//     const result = await carCollection.deleteOne(query);
//     res.send(result);
//     // res.status(200).json(result);
//   } catch (error) {
//     console.error("Delete operation failed:", error);
//     res.status(500).send({ error: "Internal Server Error" });
//   }
// });










// // app.get('/cars', async (req, res) => {

// //   const {search}=req.query;
// //   let cursor;
// //   if(search){
// //     const cursor = carCollection.find({carName:{ $rq:"react navigation development"}}).toArray()
// //     res.send({});
   
// //   } else {
    
// //     const cursor = carCollection.find();
// //   }
 
// //     const result = await cursor.toArray();
// //     res.send(result);


    

// //     // const cars = carCollection.find();
// //     // const result = await cars.toArray();
// //     // res.send(result);


// // });


// // future data  4

// // app.get('/future', async (req, res) => {
// //   try {
    
// //     const cars = carCollection.find().limit(4);
// //     const result = await cars.toArray();
    
  
// //     res.status(200).json(result); 

// //   } catch (error) {
// //     console.error("Error in /future backend:", error);
// //     res.status(500).json({ error: "Internal Server Error" });
// //   }
// // });


// app.get('/future', async (req, res) => {
 
//     const cars = carCollection.find().limit(4);
//     const result = await cars.toArray();
//     res.send(result);


// });

// // single cars get 



// app.get('/cars/:carid', loger, verifyToken,  async (req, res) => {

//   // const carid = req.params.carid;
//   // console.log(req.user ,"nadd new ");

//     const { carid } = req.params;
    
//     const query = { _id: new ObjectId(carid) };
//     const result = await carCollection.findOne(query );
//     res.send(result);

// });


// // get booking 



// app.get('/my-bookings', verifyToken, async (req, res) => {
//   try {
//     const userId = req.query.userId;

  
//     if (!userId || userId === "undefined") {
//       return res.status(400).json({ 
//         success: false, 
//         message: "User ID is required or invalid in query parameters." 
//       });
//     }

//     console.log("🎯 Requesting bookings for user ID (String):", userId);

    
//     const query = { userId: userId }; 
    
    
//     const result = await mybookingsCollection.find(query).toArray();
    
    
//     res.json(result);

//   } catch (error) {
//     console.error("❌ Express /my-bookings GET Error:", error);
   
//     res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
//   }
// });








// // booking delet 

// app.delete('/my-bookings/:id', async (req, res) => {
//   try {
//     const id = req.params.id;
    
   
//     const query = { _id: new ObjectId(id) };
//     // const query = { _id: id }; 
//     const result = await mybookingsCollection.deleteOne(query);

    
//     if (result.deletedCount === 1) {
//       res.send({ success: true, message: "Deleted successfully" });
//     } else {
//       res.send({ success: false, message: "Booking not found in database" });
//     }

//   } catch (error) {
//     console.log("Delete Error:", error);
//     res.send({ success: false, message: "Server Error" });
//   }
// });



// // patch route 



// app.patch('/my-bookings/:carid',verifyToken,  async (req, res) => {
//   const { carid } = req.params;
//   const mybookingsData=req.body;
//   const car = await carCollection.findOne({ _id: new ObjectId(carid) });
//   // const car =await mybookingsCollection.findOne({_id: new ObjectId(carid)});

// if(!car){
//  return res.status(404).json({ message: 'Car not found' });
// }
// await carCollection.updateOne({ _id: new ObjectId(carid) }, { 
//   $inc:{mybookingscount: 1},
//   $set: { lastmybookings: new Date(), },

//  });

//  const result = await mybookingsCollection.insertOne({
//   ...mybookingsData,
//   mybookingsAt: new Date(),
//  })

//  res.send(result);

// });







//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error

//     // await client.close();
//   }
// }
// run().catch(console.dir);






// // end run funtion 








// app.get('/', (req, res) => {
//   res.send('fainla  server is runing  Hello World  ok! 22');
// });


// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });


// // module.exports = app;






























