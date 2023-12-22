const express = require('express')
const cors = require('cors')
const app = express()
const port=process.env.PORT|| 5000
const jwt = require('jsonwebtoken');

require('dotenv').config()
app.use(express.json())
app.use(cors())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.S3_BUCKET}:${process.env.SECRET_KEY}@cluster0.lh0lzsv.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
    // Send a ping to confirm a successful connection
   
    const database = client.db("taskManagement");
    const benifitCollection= database.collection("benifitCollection");
    const taskCollection = database.collection("taskCollection");
    // const donationCollection= database.collection("donationCollection");
    // const cartCollection= database.collection("cartCollection");
    const userCollection= database.collection("userCollection");
    // const categoryCollection= database.collection("categoryCollection");
    // const EventsCollection= database.collection("EventsCollection");
    const sliderCollection= database.collection("sliderCollection");
    // const paymentCollection= database.collection("paymentCollection");

    // JWT Related API
    app.post('/jwt',async(req,res)=>{
      const user=req.body
      const token=jwt.sign(user,process.env.ACCESS_TOKEN,{ expiresIn: '1h' })
      res.send({token})  
    })

    // Verify token middeleware
    const verifytoken=(req,res,next)=>{
      if (!req.headers.authorization) {
        return res.status(401).send({message:'Forbidden Access'})
      }
     const token=req.headers.authorization.split(' ')[1]
    
    jwt.verify(token,process.env.ACCESS_TOKEN,(err,decoded)=>{
      if (err) {
        return res.status(401).send({message:'Forbidden Access'})
      }
      req.decoded=decoded;
      next()
    })
    }

// user verify admin after verify token
    // const verifyAdmin=async(req,res,next)=>{
    //   const email=req.decoded.email;
    //   const query={email:email}
    //   const user=await userCollection.findOne(query)
    //   const isAdmin=user?.role==='admin'
    //   if (!isAdmin) {
    //     return res.status(403).send({message:'forbidden access'})
    //   }
    //   next()
    // }

    // // users Related APi
    app.get('/users',verifytoken,async(req,res)=>{
      const result=await userCollection.find().toArray()
      res.send(result)
      console.log(result)
    })

    // app.get('/user/admin/:email',verifytoken, async(req,res)=>{
    //   const email=req.params.email
    //   // if (email!== req.decoded.email) {
    //   //   return res.status(403).send({message: 'Unauthorized'})
    //   // }
    //   const query={email:email}
    //   const user=await userCollection.findOne(query)
    //   let isAdmin= false;
    //   if (user) {
    //     isAdmin=user?.role==='admin'
    //   }
    //   res.send({isAdmin})
    //   console.log(isAdmin)
    // })

    app.delete('/users/:id',verifytoken,async(req,res)=>{
      const deleteId=req.params.id;
      const query = { _id: new ObjectId(deleteId) };
      const result = await userCollection.deleteOne(query);
      res.send(result)
      // console.log(result)
    })

    app.patch('/users/admin/:id',verifytoken,async(req,res)=>{
      const id=req.params.id;
      const filter={_id:new ObjectId(id)}
      const updatedDocs={
        $set:{
          role:'admin'
        }
      }
      const result=await userCollection.updateOne(filter,updatedDocs);
      res.send(result)
    })

    app.post('/users',async(req,res)=>{
      const user=req.body;
      const query={
        email:user.email
      }
      const existingUser=await userCollection.findOne(query)
      if (existingUser) {
        return res.send({message:'user already exists',insertedId:null})
      }
      const result=await userCollection.insertOne(user)
      res.send(result)
      console.log(result)
    })

    app.put("/users", async (req, res) => {
      const data = req.body;
      const email = data.email;
      const filter = { email: email };
      const updateDoc = {
        $set: {
          LastLogInTime: data.userLastSign,
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

//       // Slider Collection
      app.get('/slider',async(req,res)=>{
        const cursor = sliderCollection.find();
        const slider = await cursor.toArray();
        res.send(slider);
      })
      app.get('/benifit',async(req,res)=>{
        const cursor = benifitCollection.find();
        const slider = await cursor.toArray();
        res.send(slider);
      })
//       // Event Collection
//       app.get('/events',async(req,res)=>{
//         const cursor = EventsCollection.find();
//         const events = await cursor.toArray();
//         res.send(events);
//       })

//       // Category Collection
//       app.get("/Category", async (req, res) => {
//         const cursor = categoryCollection.find();
//         const Categories = await cursor.toArray();
//         res.send(Categories);
//       });
  
    
//     // Pet Collection data
//     app.get('/pet',async(req,res)=>{
//         const cursor = PetCollection.find({ adoption_status: 'Not Adopted' }); 
//         const data=await cursor.toArray()
//         res.send(data)
//     })

//     app.get('/allpets',verifytoken,verifyAdmin,async(req,res)=>{
//       const result=await PetCollection.find().toArray()
//       res.send(result)
//     })
    
//     app.get('/alldonationcampaigns',verifytoken,verifyAdmin,async(req,res)=>{
//       const result=await donationCollection.find().toArray()
//       res.send(result)
//     })

    app.delete('/taskInformation/:id',async(req,res)=>{
      const deleteId=req.params.id;
      console.log(deleteId)
      const query = { _id:new ObjectId(deleteId)};
      const result = await taskCollection.deleteOne(query);
      res.send(result)
    })

//     app.delete('/donationcampaigndelete/:id',verifytoken,verifyAdmin,async(req,res)=>{
//       const deleteId=req.params.id;
//       const query = { _id:new ObjectId(deleteId)};
//       const result = await donationCollection.deleteOne(query);
//       res.send(result)
//     })


//     app.get("/category/:id", async (req, res) => {
//       const id = req.params.id;
//       const query = { pet_category: id };
//       const cursor = PetCollection.find(query);
//       const petByCategory = await cursor.toArray();
//       res.send(petByCategory);
//     });

    app.get('/task/:id',async(req,res)=>{
      const getID=req.params.id;
      const query = { _id: new ObjectId(getID) };
      const result = await taskCollection.findOne(query);
      res.send(result)
  })

//   app.post("/requestforadoption/:id",verifytoken, async (req, res) => {
//     const PetToId = req.params.id;
//     const requestforAdoption=req.body
//     const { email } = req.body;
//     const filter = { _id: new ObjectId(PetToId) };
//     const options = { upsert: true };

//     const updateddocs={
//       $set:{
//         adoption_status: "Adopted",
//       }
//     }
//     const results= await PetCollection.updateOne(filter, updateddocs, options)
//     const result = await AdoptionCollection.insertOne(requestforAdoption);
    
//     console.log(requestforAdoption,PetToId,email,"Book Id for the new Borrow")
//     // const existing = await AdoptionCollection.findOne({ email, adoptionID: PetToId });
//     // if (existing) {
//     //   console.log()
//     //   return res.status(400).json({ error: "Duplicate entry. Book with the same email and bookId already exists." });
//     // }
//     res.send({result,results});
//   });

// app.patch('/users/adopts/:id', async(req,res)=>{
//     const getID=req.params.id;
//     const filter = { _id: new ObjectId(getID) };
//     const options = { upsert: true };
//     const updateddocs={
//       $set:{
//         adoption_status: 'Adopted',
        
//       }
//     }
//     const result= await PetCollection.updateOne(filter, updateddocs, options)
//     res.send(result)
//     console.log(result)
//   })


  app.patch('/updateTask/:id', async(req,res)=>{
    const getID=req.params.id;
    const updatedData=req.body;
    console.log(getID,updatedData)
    const filter = { _id: new ObjectId(getID) };
    const options = { upsert: true };
    const updateddocs={
      $set:{
          task_name: updatedData.task_name , 
          description: updatedData.description , 
          deadlines: updatedData.deadlines , 
          priority: updatedData.priority , 
          task_status: updatedData.task_status , 
          date_added: updatedData.date_added , 
          taskAddedby: updatedData.taskAddedby 
      }
    }
    const result= await taskCollection.updateOne(filter, updateddocs, options)
    res.send(result)
    console.log(result)
  })
  
  
    app.post('/addtaskbyuser',async(req,res)=>{
      const data=req.body
      const result=await taskCollection.insertOne(data)
      res.send(result)
      console.log(result)
    })
 
   app.get('/previousTask',async(req,res)=>{
    const email=req.query.email;
    const query={taskAddedby:email}
    const cursor = taskCollection.find(query);
    const data=await cursor.toArray()
    res.send(data) 
   })

  app.put('/updatedstatus/:id', async (req, res) => {
    const getID = req.params.id;
    const updatedData = req.body;
    console.log("Received Update Request for Task:", getID);
    console.log("Updated Data:", updatedData);

    const filter = { _id: new ObjectId(getID) };
    const options = { upsert: true };
    const updateddocs = {
        $set: {
            task_status: updatedData.task_status,
        }
    };

    try {
        const result = await taskCollection.updateOne(filter, updateddocs, options);
        console.log("Update Result:", result);
        res.send(result);
        console.log("Task status updated successfully!");
    } catch (error) {
        console.error("Error updating task status:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

 

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, function () {
  console.log('CORS-enabled web server listening on port 80')
})


