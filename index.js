
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');

const cors = require ('cors');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');
const dotenv = require('dotenv');
dotenv.config();
const app = express();

app.use(express.json());

app.use(cors());
const port = process.env.PORT || 8000;


// mongdev code 



// const uri = "mongodb+srv://<db_username>:<db_password>@cluster0.wiyy1ca.mongodb.net/?appName=Cluster0";
const uri = process.env.MONGO_URI;


  const JWKS = createRemoteJWKSet(
      new URL(`${process.env.CLINET_URL}/api/auth/jwks`)
    )
    // console.log(JWKS,"jaks one sss");


// Create a MongoClient with a MongoClientOptions object to set the Stable API version

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const loger =(req, res, next)=>{
  console.log(`[LOG] ${req.method} | ${req.url}`);
  next();
};

const verifyToken =async (req, res, next) => {
  const{ authorization } = req.headers;
  const token = authorization?.split(' ')[1];
  // console.log(token);
  if(!token){
    return res.status(401).json({ message: 'Unauthorized' });
  }



try {
    const JWKS = createRemoteJWKSet(
     new URL(`${process.env.CLINET_URL}/api/auth/jwks`)
    )
    const { payload } = await jwtVerify(token, JWKS)
    req.user = payload;
    // console.log(req.user,"user");

    // console.log(payload,"payload from token");
    // return payload
  } catch (error) {
    console.error('Token validation failed:', error)
    return res.status(401).json({ message: 'Unauthorized' });
  }


  next();
}





async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    // await client.db("admin").command({ ping: 1 });

     const db = client.db("all-cars");
    const carCollection = db.collection("cars");

    const mybookingsCollection = db.collection("my-bookings");



// all cars get 

app.get('/cars', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    // 💡 যদি ইউজার কোনো কিছু লিখে সার্চ করে (যেমন: /cars?search=toyota)
    if (search) {
      query = {
        carName: { 
          $regex: search,     // ডাইনামিক সার্চ টেক্সট
          $options: "i"       // 'i' মানে Case-insensitive (ছোট হাতের বা বড় হাতের অক্ষরের অমিল হলেও ডেটা আসবে)
        }
      };
    }

    // 💡 ডাটাবেজ থেকে কুয়েরি অনুযায়ী ডেটা খোঁজা
    const cursor = carCollection.find(query);
    const result = await cursor.toArray();
    
    // ফ্রন্টএন্ডে রেজাল্ট পাঠানো
    res.json(result);

  } catch (error) {
    console.error("Error in /cars search route:", error);
    res.status(500).json({ error: "Internal Server Error Matrix Breach" });
  }
});



// post car

app.post("/cars",async (req,res)=>{
  const data =req.body;
  const result =await carCollection.insertOne(data);
  res.send(result);


});



// my add cars show 

app.get('/my-cars', async (req, res) => {
  try {
    const email = req.query.email; // ফ্রন্টএন্ড থেকে পাঠানো কুয়েরি ইমেইল (farhad@example.com) পাচ্ছে
    
    // ⚠️ সবচেয়ে গুরুত্বপূর্ণ লাইন: ডাটাবেজের ফিল্ডের নাম 'hrEmail' হতে হবে
    const query = { hrEmail: email }; 
    
    const result = await carCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.error("Backend filter failed:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// app.get('/my-cars', async (req, res) => {
//   try {
//     const email = req.query.email; // ফ্রন্টএন্ড থেকে পাঠানো ইমেইল
    
//     if (!email) {
//       return res.status(400).send({ error: "Email query parameter is required" });
//     }

//     const query = { hrEmail: email }; // ডাটাবেজের hrEmail ফিল্ডের সাথে ম্যাচ করা হচ্ছে
//     const result = await carCollection.find(query).toArray();
//     res.send(result);
//   } catch (error) {
//     console.error("Failed to fetch user's cars:", error);
//     res.status(500).send({ error: "Internal Server Error" });
//   }
// });



// my add car delet 

// 📁 এটি আপনার ব্যাকএন্ডের এক্সপ্রেস ফাইলে (index.js) চেক করুন বা যোগ করুন
const { ObjectId } = require('mongodb'); // ফাইলের একদম উপরে এটি নিশ্চিত করুন

app.delete('/cars/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // ⚠️ আইডি অবজেক্টে কনভার্ট করা আবশ্যক
    const query = { _id: new ObjectId(id) }; 
    
    const result = await carCollection.deleteOne(query);
    res.send(result);
  } catch (error) {
    console.error("Delete operation failed:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});










// app.get('/cars', async (req, res) => {

//   const {search}=req.query;
//   let cursor;
//   if(search){
//     const cursor = carCollection.find({carName:{ $rq:"react navigation development"}}).toArray()
//     res.send({});
   
//   } else {
    
//     const cursor = carCollection.find();
//   }
 
//     const result = await cursor.toArray();
//     res.send(result);


    

//     // const cars = carCollection.find();
//     // const result = await cars.toArray();
//     // res.send(result);


// });


// future data  4




app.get('/future', async (req, res) => {
 
    const cars = carCollection.find().limit(4);
    const result = await cars.toArray();
    res.send(result);


});

// single cars get 



app.get('/cars/:carid', loger, verifyToken,  async (req, res) => {

  // const carid = req.params.carid;
  // console.log(req.user ,"nadd new ");

    const { carid } = req.params;
    
    const query = { _id: new ObjectId(carid) };
    const result = await carCollection.findOne(query );
    res.send(result);

});


// get booking 


// 🎯 এক্সপ্রেস ব্যাকএন্ড (GET /my-bookings)
app.get('/my-bookings', verifyToken, async (req, res) => {
  try {
    const userId = req.query.userId;

    // ১. সেফটি চেক: যদি userId কোনো কারণে আনডিফাইনড বা ফাঁকা আসে
    if (!userId || userId === "undefined") {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required or invalid in query parameters." 
      });
    }

    console.log("🎯 Requesting bookings for user ID (String):", userId);

    // ⚠️ অত্যন্ত গুরুত্বপূর্ণ: এখানে 'new ObjectId(userId)' ব্যবহার করবেন না!
    // যেহেতু ডাটাবেজে আইডিটি স্ট্রিং হিসেবে আছে, সরাসরি স্ট্রিং দিয়েই কোয়েরি করতে হবে।
    const query = { userId: userId }; 
    
    // ডাটাবেজ থেকে ডাটা খুঁজে অ্যারে আকারে নেওয়া
    const result = await mybookingsCollection.find(query).toArray();
    
    // ফ্রন্টএন্ডে ক্লিন JSON ডাটা পাঠানো
    res.json(result);

  } catch (error) {
    console.error("❌ Express /my-bookings GET Error:", error);
    // যদি কোনো ভুল হয়, ফ্রন্টএন্ড যেন ক্র্যাশ না করে সেজন্য JSON ফরমেটে এরর পাঠানো
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
});





// my-booking delete 

// app.get("/my-bookings", verifyToken, async (req, res) => {
//   try {
//     // 💡 ভুল সংশোধন: req.params এর বদলে req.query ব্যবহার করা হয়েছে
//     const userId = req.query.userId; 

//     if (!userId) {
//       return res.status(400).send({ success: false, message: "User ID is required in query parameters." });
//     }

//     console.log("Fetching bookings for User ID:", userId);

//     // 🎯 ভুল সংশোধন: carCollection এর বদলে mybookingsCollection থেকে ডাটা খোঁজা হচ্ছে
//     const result = await mybookingsCollection.find({ userId: userId }).toArray();
    
//     // ফ্রন্টএন্ডে ডাটা পাঠিয়ে দেওয়া
//     res.send(result);

//   } catch (error) {
//     console.error("GET My Bookings Error:", error);
//     res.status(500).send({ success: false, message: "Server Error", error: error.message });
//   }
// });



// app.get("/my-bookings",verifyToken,  async (req, res)=>{
//   const {userId}=req.userId;
//   const result= await carCollection.find({userId:userId}).toArray();
//   res.send(result);

// })





// app.get("/my-bookings", verifyToken, async (req, res) => {
//   try {
//     // 💡 ইউআরএল-এর ভেতরের ?userId= অংশ থেকে আইডিটি নেওয়া হচ্ছে
//     const userId = req.query.userId; 

//     if (!userId) {
//       return res.status(400).send({ success: false, message: "User ID missing" });
//     }

//     // 🎯 ডাটাবেজের 'mybookingsCollection' থেকে ওই ইউজারের সব বুকিং খুঁজে বের করা
//     const result = await mybookingsCollection.find({ userId: userId }).toArray();
    
//     // ফ্রন্টএন্ডে অ্যারে আকারে সব বুকিং ডাটা পাঠিয়ে দেওয়া
//     res.send(result);
//   } catch (error) {
//     console.log("GET Bookings Error:", error);
//     res.status(500).send([]);
//   }
// });



// booking delet 

app.delete('/my-bookings/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // ডাটাবেজের আইডি সরাসরি স্ট্রিং কুয়েরি করা হচ্ছে
    const query = { _id: new ObjectId(id) };
    // const query = { _id: id }; 
    const result = await mybookingsCollection.deleteOne(query);

    // মঙ্গোডিবিতে আসলেই ডিলিট হয়েছে কিনা তা চেক করে রেসপন্স পাঠানো
    if (result.deletedCount === 1) {
      res.send({ success: true, message: "Deleted successfully" });
    } else {
      res.send({ success: false, message: "Booking not found in database" });
    }

  } catch (error) {
    console.log("Delete Error:", error);
    res.send({ success: false, message: "Server Error" });
  }
});


// app.delete('/my-bookings/:id', verifyToken, async (req, res) => {
//   try {
//     const id = req.params.id;
    
//     // Better-Auth এর আইডি সরাসরি স্ট্রিং হওয়ায় কোনো ObjectId ছাড়াই কুয়েরি
//     const query = { _id: id }; 
//     const result = await bookingCollection.deleteOne(query);

//     // ফ্রন্টএন্ডে সরাসরি রেসপন্স পাঠানো
//     res.send({ success: true, result });

//   } catch (error) {
//     console.log("Delete Error:", error);
//     res.send({ success: false, message: "Server Error" });
//   }
// });







// patch route 



app.patch('/my-bookings/:carid',verifyToken,  async (req, res) => {
  const { carid } = req.params;
  const mybookingsData=req.body;
  const car = await carCollection.findOne({ _id: new ObjectId(carid) });
  // const car =await mybookingsCollection.findOne({_id: new ObjectId(carid)});

if(!car){
 return res.status(404).json({ message: 'Car not found' });
}
await carCollection.updateOne({ _id: new ObjectId(carid) }, { 
  $inc:{mybookingscount: 1},
  $set: { lastmybookings: new Date(), },

 });

 const result = await mybookingsCollection.insertOne({
  ...mybookingsData,
  mybookingsAt: new Date(),
 })

 res.send(result);

});








//  app.patch('/cars/:carid', loger, verifyToken, async (req, res) => {
//       try {
//         const { carid } = req.params;
//         const updateData = req.body; 
//         const query = { _id: new ObjectId(carid) };
//         const updateDoc = { $set: updateData };
//         const result = await carCollection.updateOne(query, updateDoc);
        
//         if (result.matchedCount === 0) {
//           return res.status(404).send({ error: "Car node not found for update" });
//         } else if (result.modifiedCount === 0) {
//           return res.status(200).send({ message: "No changes were made to the car data." });
//         }
//         res.send({ success: true, message: "Vehicle data successfully updated." });
//       } catch (error) {
//         res.status(500).send({ error: "Failed to update vehicle metrics." });
//       }
//     });









    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error

    // await client.close();
  }
}
run().catch(console.dir);








app.get('/', (req, res) => {
  res.send('Hello World  ok!');
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
// app.use(express.json()); 

// const port = process.env.PORT || 8000;
// const uri = process.env.MONGO_URI;

// // MongoDB ক্লায়েন্ট ইনিশিয়ালিজেশন
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// // 📋 ১. সিস্টেম লগার মিডলওয়্যার
// const loger = (req, res, next) => {
//   console.log(`[LOG] ${req.method} -> ${req.url}`);
//   next();
// };

// // 🔒 ২. সিকিউরিটি টোকেন ভেরিফিকেশন মিডলওয়্যার
// const verifyToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;
  
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     console.log("❌ Request Blocked: Authorization Header Missing.");
//     return res.status(401).json({ error: 'Authorization header is missing or malformed' });
//   }

//   const token = authHeader.split(' ')[1];

//   if (!token || token === 'null' || token === 'undefined') {
//     console.log("❌ Request Blocked: Token is null or empty.");
//     return res.status(401).json({ error: 'Unauthorized Node Identifier' });
//   }

//   console.log("✅ Token successfully verified in terminal.");
//   req.clientToken = token; 
//   next();
// };

// async function run() {
//   try {
//     // 📡 ডাটাবেজ কানেকশন এস্টাবলিশ করা
//     // await client.connect(); // Vercel Serverless-এর জন্য এটি কমেন্ট রাখাই ভালো
    
//     const db = client.db("all-cars");
//     const carCollection = db.collection("cars");
//     const bookingCollection = db.collection("bookings"); 

//     console.log("📡 Connected successfully to MongoDB Grid Matrix!");

//     // ----------------- VEHICLE SYSTEM ROUTES (গাড়ি সংক্রান্ত রুট) -----------------

//     // 🚗 ১. সকল গাড়ি গেট করার পাবলিক রুট (Home/Explore Page)
//     app.get('/cars', loger, async (req, res) => {
//       try {
//         const cursor = carCollection.find();
//         const result = await cursor.toArray();
//         res.send(result);
//       } catch (error) {
//         res.status(500).send({ error: "Failed to fetch fleet array" });
//       }
//     });

//     // 🔒 ২. নির্দিষ্ট ইউজারের অ্যাড করা গাড়ি পাওয়ার সিকিউর রুট (My Add Cars Page)
//     app.get('/my-cars', loger, verifyToken, async (req, res) => {
//       try {
//         const email = req.query.email;
//         if (!email) {
//           return res.status(400).send({ error: "User email registry query is missing." });
//         }
//         const query = { userEmail: email }; 
//         const result = await carCollection.find(query).toArray();
//         res.send(result);
//       } catch (error) {
//         console.error("Database query crash:", error);
//         res.status(500).send({ error: "Internal Server Database error." });
//       }
//     });

//     // 🔒 ৩. নির্দিষ্ট গাড়ি গেট করার সিকিউর রুট (Details Page-এর জন্য)
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

//     // 📥 ৪. নতুন গাড়ি ডাটাবেজে ইনজেক্ট করার সিকিউর রুট (POST)
    // app.post('/cars', loger, verifyToken, async (req, res) => {
    //   try {
    //     const newCar = req.body;
        
    //     // ভ্যালিডেশন চেক
    //     if (!newCar.carName || !newCar.dailyPrice) {
    //       return res.status(400).send({ error: "Critical vehicle properties missing." });
    //     }

    //     const result = await carCollection.insertOne(newCar);
    //     res.status(201).send({ success: true, insertedId: result.insertedId });
    //   } catch (error) {
    //     console.error("Failed to inject vehicle:", error);
    //     res.status(500).send({ error: "Failed to deploy car to grid repository." });
    //   }
    // });

//     // 🔧 ৫. গাড়ি আপডেট করার সিকিউর রুট
//     app.patch('/cars/:carid', loger, verifyToken, async (req, res) => {
//       try {
//         const { carid } = req.params;
//         const updateData = req.body; 
//         const query = { _id: new ObjectId(carid) };
//         const updateDoc = { $set: updateData };
//         const result = await carCollection.updateOne(query, updateDoc);
        
//         if (result.matchedCount === 0) {
//           return res.status(404).send({ error: "Car node not found for update" });
//         } else if (result.modifiedCount === 0) {
//           return res.status(200).send({ message: "No changes were made to the car data." });
//         }
//         res.send({ success: true, message: "Vehicle data successfully updated." });
//       } catch (error) {
//         res.status(500).send({ error: "Failed to update vehicle metrics." });
//       }
//     });

//     // 🗑️ ६. গাড়ি ডিলিট করার সিকিউর রুট
//     app.delete('/cars/:carid', loger, verifyToken, async (req, res) => {
//       try {
//         const { carid } = req.params;
//         const query = { _id: new ObjectId(carid) };
//         const result = await carCollection.deleteOne(query);
        
//         if (result.deletedCount === 1) {
//           res.send({ success: true, message: "Vehicle decommissioned from grid." });
//         } else {
//           res.status(404).send({ error: "Vehicle target not found in Database." });
//         }
//       } catch (error) {
//         res.status(500).send({ error: "Failed to wipe target data." });
//       }
//     });

//     // 📅 ----------------- BOOKING SYSTEM ROUTES (বুকিং সংক্রান্ত রুট) -----------------

//     // 📥 ৭. নতুন বুকিং রিকোয়েস্ট সেভ করার রুট (POST) -> [🎯 ওভাররাইট বাগ ফিক্সড করা হয়েছে]
//     app.post('/bookings', loger, verifyToken, async (req, res) => {
//       try {
//         const bookingPayload = req.body;
        
//         if (bookingPayload.carId && ObjectId.isValid(bookingPayload.carId)) {
//           const carIdObj = new ObjectId(bookingPayload.carId);
          
//           // 🛡️ সেফটি চেক: গাড়িটি আসলেই ডাটাবেসে Available আছে কিনা দেখে নেওয়া
//           const targetCar = await carCollection.findOne({ _id: carIdObj });
          
//           if (!targetCar) {
//             return res.status(404).send({ error: "Automotive node not found in grid." });
//           }
          
//           // যদি গাড়িটি অলরেডি Unavailable থাকে, তবে ডুপ্লিকেট বুকিং রিকোয়েস্ট ব্লক করে দেবে
//           if (targetCar.availabilityStatus === 'Unavailable') {
//             return res.status(400).send({ error: "Vehicle is already locked down and booked by another node." });
//           }
          
//           // গাড়ি Available থাকলেই কেবল স্ট্যাটাস 'Unavailable' এ লক হবে
//           await carCollection.updateOne(
//             { _id: carIdObj },
//             { $set: { availabilityStatus: 'Unavailable' } }
//           );
//         }
        
//         const result = await bookingCollection.insertOne(bookingPayload);
//         res.status(201).send({ success: true, insertedId: result.insertedId });
//       } catch (error) {
//         console.error("Lease protocol crash:", error);
//         res.status(500).send({ error: "Failed to execute lease protocol." });
//       }
//     });

//     // 📤 ৮. নির্দিষ্ট ইউজারের বুকিং লিস্ট পাওয়ার রুট (GET)
//     app.get('/my-bookings', loger, verifyToken, async (req, res) => {
//       try {
//         const email = req.query.email;
//         if (!email) {
//           return res.status(400).send({ error: "Required client parameters missing." });
//         }
        
//         // ফিল্টার: যেগুলোর স্ট্যাটাস 'Canceled' নয়, শুধু সেগুলোই UI-তে পাঠাবে
//         const query = { 
//           userEmail: email,
//           status: { $ne: 'Canceled' } 
//         };
        
//         const result = await bookingCollection.find(query).toArray();
//         res.send(result);
//       } catch (error) {
//         res.status(500).send({ error: "Failed to fetch allocation matrices." });
//       }
//     });

//     // 🔄 ৯. একক বুকিং ক্যানসেল করার সিকিউর রুট (PATCH)
//     app.patch('/bookings/:id', loger, verifyToken, async (req, res) => {
//       try {
//         const { id } = req.params;

//         // আইডি ভ্যালিডেশন চেক
//         if (!id || id === 'undefined' || !ObjectId.isValid(id)) {
//           return res.status(400).json({ error: "Invalid or missing Booking ID matrix." });
//         }

//         const query = { _id: new ObjectId(id) };
        
//         // বুকিংটি ডেটাবেজে এক্সিস্ট করে কিনা চেক করা
//         const targetBooking = await bookingCollection.findOne(query);
//         if (!targetBooking) {
//           return res.status(404).json({ error: "Target booking node not found." });
//         }

//         const updateDoc = { $set: { status: 'Canceled' } };
//         const result = await bookingCollection.updateOne(query, updateDoc);

//         // বুকিং ক্যানসেল হওয়ার সাথে সাথে গাড়িটিকে পুনরায় 'Available' করা
//         if (targetBooking.carId && ObjectId.isValid(targetBooking.carId)) {
//           await carCollection.updateOne(
//             { _id: new ObjectId(targetBooking.carId) },
//             { $set: { availabilityStatus: 'Available' } }
//           );
//         }

//         res.json({ success: true, message: "Node status terminated and synchronized." });
//       } catch (error) {
//         console.error("Critical Patch Error:", error);
//         res.status(500).json({ error: "Internal Database execution failure." });
//       }
//     });

//   } catch (err) {
//     console.error("❌ Database connection error:", err);
//   }
// }

// // রান প্রোটোকল এক্সিকিউট করা
// run().catch(console.dir);

// // পাবলিক বেস রুট (সার্ভার রানিং টেস্ট করার জন্য)
// app.get('/', (req, res) => {
//   res.send('🚀 Cyberpunk Vehicle Grid Server Matrix is Active!');
// });

// // সার্ভার লিসেনিং রুট
// app.listen(port, () => {
//   console.log(`🚀 Server Matrix active safely on port ${port}`);
// });




















































// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();

// // ⚙️ গ্লোবাল মিডলওয়্যার কনফিগারেশন
// app.use(cors());
// app.use(express.json()); // 👈 ফ্রন্টএন্ড থেকে আসা JSON বডি রিড করার জন্য এটি আবশ্যক

// const port = process.env.PORT || 8000;
// const uri = process.env.MONGO_URI;

// // MongoDB ক্লায়েন্ট ইনিশিয়ালিজেশন
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// // 📋 ১. সিস্টেম লগার মিডলওয়্যার
// const loger = (req, res, next) => {
//   console.log(`[LOG] ${req.method} -> ${req.url}`);
//   next();
// };

// // 🔒 ২. সিকিউরিটি টোকেন ভেরিফিকেশন মিডলওয়্যার
// const verifyToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;
  
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     console.log("❌ Request Blocked: Authorization Header Missing.");
//     return res.status(401).json({ error: 'Authorization header is missing or malformed' });
//   }

//   const token = authHeader.split(' ')[1];

//   if (!token || token === 'null' || token === 'undefined') {
//     console.log("❌ Request Blocked: Token is null or empty.");
//     return res.status(401).json({ error: 'Unauthorized Node Identifier' });
//   }

//   console.log("✅ Token successfully verified in terminal.");
//   req.clientToken = token; 
//   next();
// };

// async function run() {
//   try {
//     // 📡 ডাটাবেজ কানেকশন এস্টাবলিশ করা

//     // commit for deploy

//     // await client.connect();
    
//     const db = client.db("all-cars");
//     const carCollection = db.collection("cars");
//     const bookingCollection = db.collection("bookings"); 

//     console.log("📡 Connected successfully to MongoDB Grid Matrix!");

//     // ----------------- VEHICLE SYSTEM ROUTES (গাড়ি সংক্রান্ত রুট) -----------------

//     // 🚗 ১. সকল গাড়ি গেট করার পাবলিক রুট (Home/Explore Page)
//     app.get('/cars', loger, async (req, res) => {
//       try {
//         const cursor = carCollection.find();
//         const result = await cursor.toArray();
//         res.send(result);
//       } catch (error) {
//         res.status(500).send({ error: "Failed to fetch fleet array" });
//       }
//     });

//     // 🔒 ২. নির্দিষ্ট ইউজারের অ্যাড করা গাড়ি পাওয়ার সিকিউর রুট (My Add Cars Page)
//     app.get('/my-cars', loger, verifyToken, async (req, res) => {
//       try {
//         const email = req.query.email;
//         if (!email) {
//           return res.status(400).send({ error: "User email registry query is missing." });
//         }
//         const query = { userEmail: email }; 
//         const result = await carCollection.find(query).toArray();
//         res.send(result);
//       } catch (error) {
//         console.error("Database query crash:", error);
//         res.status(500).send({ error: "Internal Server Database error." });
//       }
//     });

//     // 🔒 ৩. নির্দিষ্ট গাড়ি গেট করার সিকিউর রুট (Details Page-এর জন্য)
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

//     // 📥 ৪. নতুন গাড়ি ডাটাবেজে ইনজেক্ট করার সিকিউর রুট (POST) [🎯 নিউ রুট যুক্ত করা হয়েছে]
//     app.post('/cars', loger, verifyToken, async (req, res) => {
//       try {
//         const newCar = req.body;
        
//         // ভ্যালিডেশন চেক
//         if (!newCar.carName || !newCar.dailyPrice) {
//           return res.status(400).send({ error: "Critical vehicle properties missing." });
//         }

//         const result = await carCollection.insertOne(newCar);
//         res.status(201).send({ success: true, insertedId: result.insertedId });
//       } catch (error) {
//         console.error("Failed to inject vehicle:", error);
//         res.status(500).send({ error: "Failed to deploy car to grid repository." });
//       }
//     });

//     // 🔧 ৫. গাড়ি আপডেট করার সিকিউর রুট
//     app.patch('/cars/:carid', loger, verifyToken, async (req, res) => {
//       try {
//         const { carid } = req.params;
//         const updateData = req.body; 
//         const query = { _id: new ObjectId(carid) };
//         const updateDoc = { $set: updateData };
//         const result = await carCollection.updateOne(query, updateDoc);
        
//         if (result.matchedCount === 0) {
//           return res.status(404).send({ error: "Car node not found for update" });
//         } else if (result.modifiedCount === 0) {
//           return res.status(200).send({ message: "No changes were made to the car data." });
//         }
//         res.send({ success: true, message: "Vehicle data successfully updated." });
//       } catch (error) {
//         res.status(500).send({ error: "Failed to update vehicle metrics." });
//       }
//     });

//     // 🗑️ ৬. গাড়ি ডিলিট করার সিকিউর রুট
//     app.delete('/cars/:carid', loger, verifyToken, async (req, res) => {
//       try {
//         const { carid } = req.params;
//         const query = { _id: new ObjectId(carid) };
//         const result = await carCollection.deleteOne(query);
        
//         if (result.deletedCount === 1) {
//           res.send({ success: true, message: "Vehicle decommissioned from grid." });
//         } else {
//           res.status(404).send({ error: "Vehicle target not found in Database." });
//         }
//       } catch (error) {
//         res.status(500).send({ error: "Failed to wipe target data." });
//       }
//     });

//     // 📅 ----------------- BOOKING SYSTEM ROUTES (বুকিং সংক্রান্ত রুট) -----------------

//     // 📥 ৭. নতুন বুকিং রিকোয়েস্ট সেভ করার রুট (POST)
//     app.post('/bookings', loger, verifyToken, async (req, res) => {
//       try {
//         const bookingPayload = req.body;
        
//         // বুকিং তৈরি করার সাথে সাথে গাড়ির স্টেট 'Unavailable' করার আর্কিটেকচার লজিক
//         if (bookingPayload.carId && ObjectId.isValid(bookingPayload.carId)) {
//           await carCollection.updateOne(
//             { _id: new ObjectId(bookingPayload.carId) },
//             { $set: { availabilityStatus: 'Unavailable' } }
//           );
//         }
        
//         const result = await bookingCollection.insertOne(bookingPayload);
//         res.status(201).send({ success: true, insertedId: result.insertedId });
//       } catch (error) {
//         res.status(500).send({ error: "Failed to execute lease protocol." });
//       }
//     });

//     // 📤 ৮. নির্দিষ্ট ইউজারের বুকিং লিস্ট পাওয়ার রুট - ক্যানসেল হওয়াগুলো ফিল্টার আউট করার লজিকসহ (GET)
//     app.get('/my-bookings', loger, verifyToken, async (req, res) => {
//       try {
//         const email = req.query.email;
//         if (!email) {
//           return res.status(400).send({ error: "Required client parameters missing." });
//         }
        
//         // 🎯 ফিল্টার: যেগুলোর স্ট্যাটাস 'Canceled' নয়, শুধু সেগুলোই UI-তে পাঠাবে (Reload দিলেও আসবে না)
//         const query = { 
//           userEmail: email,
//           status: { $ne: 'Canceled' } 
//         };
        
//         const result = await bookingCollection.find(query).toArray();
//         res.send(result);
//       } catch (error) {
//         res.status(500).send({ error: "Failed to fetch allocation matrices." });
//       }
//     });

//     // 🔄 ৯. একক বুকিং ক্যানসেল করার সিকিউর রুট (PATCH)
//     app.patch('/bookings/:id', loger, verifyToken, async (req, res) => {
//       try {
//         const { id } = req.params;

//         // 🛡️ আইডি ভ্যালিডেশন চেক (যাতে সিস্টেম ক্র্যাশ না করে)
//         if (!id || id === 'undefined' || !ObjectId.isValid(id)) {
//           return res.status(400).json({ error: "Invalid or missing Booking ID matrix." });
//         }

//         const query = { _id: new ObjectId(id) };
        
//         // বুকিংটি ডেটাবেজে এক্সিস্ট করে কিনা চেক করা
//         const targetBooking = await bookingCollection.findOne(query);
//         if (!targetBooking) {
//           return res.status(404).json({ error: "Target booking node not found." });
//         }

       
//         const updateDoc = { $set: { status: 'Canceled' } };
//         const result = await bookingCollection.updateOne(query, updateDoc);

        
//         if (targetBooking.carId && ObjectId.isValid(targetBooking.carId)) {
//           await carCollection.updateOne(
//             { _id: new ObjectId(targetBooking.carId) },
//             { $set: { availabilityStatus: 'Available' } }
//           );
//         }

//         res.json({ success: true, message: "Node status terminated and synchronized." });
//       } catch (error) {
//         console.error("Critical Patch Error:", error);
//         res.status(500).json({ error: "Internal Database execution failure." });
//       }
//     });

//   } catch (err) {
//     console.error("❌ Database connection error:", err);
//   }
// }

// // রান প্রোটোকল এক্সিকিউট করা
// run().catch(console.dir);

// // পাবলিক বেস রুট (সার্ভার রানিং টেস্ট করার জন্য)
// app.get('/', (req, res) => {
//   res.send('🚀 Cyberpunk Vehicle Grid Server Matrix is Active!');
// });

// // সার্ভার লিসেনিং রুট
// app.listen(port, () => {
//   console.log(`🚀 Server Matrix active safely on port ${port}`);
// });





















// wthiout detelad








// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// app.use(cors());
// app.use(express.json()); 

// const port = process.env.PORT || 8000;
// const uri = process.env.MONGO_URI;

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// // 📋 ১. লগার মিডলওয়্যার
// const loger = (req, res, next) => {
//   console.log(`[LOG] ${req.method} -> ${req.url}`);
//   next();
// };

// // 🔒 ২. টোকেন ভেরিফিকেশন মিডলওয়্যার
// const verifyToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;
  
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     console.log("❌ Request Blocked: Authorization Header Missing.");
//     return res.status(401).json({ error: 'Authorization header is missing or malformed' });
//   }

//   const token = authHeader.split(' ')[1];

//   if (!token || token === 'null' || token === 'undefined') {
//     console.log("❌ Request Blocked: Token is null or empty.");
//     return res.status(401).json({ error: 'Unauthorized Node Identifier' });
//   }

//   console.log("✅ Token successfully verified in terminal:", token);
//   req.clientToken = token; 
//   next();
// };

// async function run() {
//   try {
//     await client.connect();
    
//     const db = client.db("all-cars");
//     const carCollection = db.collection("cars");
//     const bookingCollection = db.collection("bookings"); // 📋 বুকিং কালেকশন

//     // 🚗 ১. সকল গাড়ি গেট করার পাবলিক রুট (Home/Explore Page)
//     app.get('/cars', loger, async (req, res) => {
//       try {
//         const cursor = carCollection.find();
//         const result = await cursor.toArray();
//         res.send(result);
//       } catch (error) {
//         res.status(500).send({ error: "Failed to fetch fleet array" });
//       }
//     });

//     // 🔒 ২. নির্দিষ্ট ইউজারের অ্যাড করা গাড়ি পাওয়ার সিকিউর রুট
//     app.get('/my-cars', loger, verifyToken, async (req, res) => {
//       try {
//         const email = req.query.email;

//         if (!email) {
//           return res.status(400).send({ error: "User email registry query is missing." });
//         }

//         const query = { userEmail: email }; 
//         const result = await carCollection.find(query).toArray();
//         res.send(result);
//       } catch (error) {
//         console.error("Database query crash:", error);
//         res.status(500).send({ error: "Internal Server Database error." });
//       }
//     });

//     // 🔒 ৩. নির্দিষ্ট গাড়ি গেট করার সিকিউর রুট
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

//     // 🔧 ৪. গাড়ি আপডেট করার সিকিউর রুট (Fixed Syntax Error)
//     app.patch('/cars/:carid', loger, verifyToken, async (req, res) => {
//       try {
//         const { carid } = req.params;
//         const updateData = req.body; 
//         const query = { _id: new ObjectId(carid) };
//         const updateDoc = { $set: updateData };
//         const result = await carCollection.updateOne(query, updateDoc);
        
//         if (result.matchedCount === 0) {
//           return res.status(404).send({ error: "Car node not found for update" });
//         } else if (result.modifiedCount === 0) {
//           return res.status(200).send({ message: "No changes were made to the car data." });
//         }
        
//         res.send({ success: true, message: "Vehicle data successfully updated." });
//       } catch (error) {
//         res.status(500).send({ error: "Failed to update vehicle metrics." });
//       }
//     });

//     // 🗑️ ৫. গাড়ি ডিলিট করার সিকিউর রুট
//     app.delete('/cars/:carid', loger, verifyToken, async (req, res) => {
//       try {
//         const { carid } = req.params;
//         const query = { _id: new ObjectId(carid) };
//         const result = await carCollection.deleteOne(query);
        
//         if (result.deletedCount === 1) {
//           res.send({ success: true, message: "Vehicle decommissioned from grid." });
//         } else {
//           res.status(404).send({ error: "Vehicle target not found." });
//         }
//       } catch (error) {
//         res.status(500).send({ error: "Failed to wipe target data." });
//       }
//     });

//     // 📅 ----------------- BOOKING SYSTEM ROUTES ----------------- 📅

//     // 📥 ৬. নতুন বুকিং রিকোয়েস্ট সেভ করার রুট (POST)
//     app.post('/bookings', loger, verifyToken, async (req, res) => {
//       try {
//         const bookingPayload = req.body;
        
//         // বুকিং তৈরি করার সাথে সাথে গাড়ির স্টেট 'Unavailable' করার বোনাস লজিক
//         if (bookingPayload.carId) {
//           await carCollection.updateOne(
//             { _id: new ObjectId(bookingPayload.carId) },
//             { $set: { availabilityStatus: 'Unavailable' } }
//           );
//         }

//         const result = await bookingCollection.insertOne(bookingPayload);
//         res.status(201).send({ success: true, insertedId: result.insertedId });
//       } catch (error) {
//         res.status(500).send({ error: "Failed to execute lease protocol." });
//       }
//     });

//     // 📤 ৭. নির্দিষ্ট ইউজারের বুকিং করা লিস্ট পাওয়ার রুট (GET)
//     app.get('/my-bookings', loger, verifyToken, async (req, res) => {
//       try {
//         const email = req.query.email;
//         if (!email) {
//           return res.status(400).send({ error: "Required client parameters missing." });
//         }
        
//         const query = { userEmail: email };
//         const result = await bookingCollection.find(query).toArray();
//         res.send(result);
//       } catch (error) {
//         res.status(500).send({ error: "Failed to fetch allocation matrices." });
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
















// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// app.use(cors());
// app.use(express.json()); 

// const port = process.env.PORT || 8000;
// const uri = process.env.MONGO_URI;

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// // 📋 ১. লগার মিডলওয়্যার
// const loger = (req, res, next) => {
//   console.log(`[LOG] ${req.method} -> ${req.url}`);
//   next();
// };

// // 🔒 ২. টোকen ভেরিফিকেশন মিডলওয়্যার
// const verifyToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;
  
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     console.log("❌ Request Blocked: Authorization Header Missing.");
//     return res.status(401).json({ error: 'Authorization header is missing or malformed' });
//   }

//   const token = authHeader.split(' ')[1];

//   if (!token || token === 'null' || token === 'undefined') {
//     console.log("❌ Request Blocked: Token is null or empty.");
//     return res.status(401).json({ error: 'Unauthorized Node Identifier' });
//   }

//   console.log("✅ Token successfully verified in terminal:", token);
//   req.clientToken = token; 
//   next();
// };

// async function run() {
//   try {
//     await client.connect();
    
//     const db = client.db("all-cars");
//     const carCollection = db.collection("cars");
//     const bookingCollection = db.collection("bookings");

//     // 🚗 ১. সকল গাড়ি গেট করার পাবলিক রুট (Home/Explore Page)
//     app.get('/cars', loger, async (req, res) => {
//       try {
//         const cursor = carCollection.find();
//         const result = await cursor.toArray();
//         res.send(result);
//       } catch (error) {
//         res.status(500).send({ error: "Failed to fetch fleet array" });
//       }
//     });

//     // 🔒 ২. নির্দিষ্ট ইউজারের অ্যাড করা গাড়ি পাওয়ার নতুন সিকিউর রুট (My Add Cars Page-এর জন্য)
//     // ইউজাররা যাতে একে অপরের ডাটা না দেখতে পারে তার জন্য এই রুট ভেরিফাইড
//     app.get('/my-cars', loger, verifyToken, async (req, res) => {
//       try {
//         // ফ্রন্টএন্ড থেকে পাঠানো কুয়েরি প্যারামিটার (যেমন: /my-cars?email=farhad@example.com)
//         const email = req.query.email;

//         if (!email) {
//           return res.status(400).send({ error: "User email registry query is missing." });
//         }

//         // ডাটাবেজে গাড়ি সেভ করার সময় আপনি যে ফিল্ডে ইমেইল রাখছেন, ঠিক সেই ফিল্ডের নাম এখানে দিন (যেমন: userEmail বা ownerEmail)
//         const query = { userEmail: email }; 
        
//         const result = await carCollection.find(query).toArray();
//         res.send(result);
//       } catch (error) {
//         console.error("Database query crash:", error);
//         res.status(500).send({ error: "Internal Server Database error." });
//       }
//     });

//     // 🔒 ৩. নির্দিষ্ট গাড়ি গেট করার সিকিউর রুট
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



//     app.patch('/cars/:carid', loger, verifyToken, async (req, res) => {
//       try {
//         const { carid } = req.params;
//         const updateData = req.body; // ফ্রন্টএন্ড থেকে আপডেট ডাটা  
//         const query = { _id: new ObjectId(carid) };
//         const updateDoc = { $set: updateData };
//         const result = await carCollection.updateOne(query, updateDoc);
        
//         if (result.matchedCount === 0) {
//           return res.status(404).send({ error: "Car node not found for update" });
//         } else if (result.modifiedCount === 0) {
//           return res.status(200).send({ message: "No changes were made to the car data." });
//         } else {}
//           res.send({ success: true, message: "Vehicle data successfully updated." });
//       }  






//     // 🗑️ ৪. গাড়ি ডিলিট করার সিকিউর রুট (Wipe Action)
//     app.delete('/cars/:carid', loger, verifyToken, async (req, res) => {
//       try {
//         const { carid } = req.params;
//         const query = { _id: new ObjectId(carid) };
//         const result = await carCollection.deleteOne(query);
        
//         if (result.deletedCount === 1) {
//           res.send({ success: true, message: "Vehicle decommissioned from grid." });
//         } else {
//           res.status(404).send({ error: "Vehicle target not found." });
//         }
//       } catch (error) {
//         res.status(500).send({ error: "Failed to wipe target data." });
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