const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

//middlewire
app.use(cors());
app.use(express.json());

//database connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.loxap.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("Database Connected");

    const database = client.db("bikerz_shop");
    const bikesCollection = database.collection("bikes");
    const usersCollection = database.collection("users");
    const ordersCollection = database.collection("orders");
    const reviewsCollection = database.collection("reviews");

    // =======================PRODUCT CRUD OPERATION=================
    //Add a product
    app.post("/addproduct", async (req, res) => {
      const product = req.body;
      const result = await bikesCollection.insertOne(product);
      console.log("new product added to database");
      res.json(result);
    });

    //Get all the products
    app.get("/products", async (req, res) => {
      console.log("Reading the products data");
      const cursor = bikesCollection.find({});
      const allProducts = await cursor.toArray();
      res.json(allProducts);
    });

    //Get a specific products
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      console.log("This product id is ", id);
      const query = { _id: ObjectId(id) };
      const result = await bikesCollection.findOne(query);
      res.json(result);
    });

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Deleting the product with id ", id);
      const query = { _id: ObjectId(id) };
      const result = await bikesCollection.deleteOne(query);
      res.send(result);
    });

    // ========================User CRUD OPERATION====================
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log("Adding new user ", user);
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role == "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      console.log("Email user ", user);
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      console.log("admin ", user);
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // ===========================ORDER CRUD OPERATION=====================

    //Add an order
    app.post("/orders", async (req, res) => {
      const order = req.body;
      console.log("Customer order ", order);
      const result = await ordersCollection.insertOne(order);
      res.json(result);
    });

    //single user order
    app.get("/myorders", async (req, res) => {
      const email = req.query.email;
      const query = { "orderInfo.email": email };
      const cursor = ordersCollection.find(query);
      const orders = await cursor.toArray();
      res.json(orders);
    });

    //get all user order
    app.get("/allorders", async (req, res) => {
      console.log("Getting all user orders");
      const cursor = ordersCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    });

    //update an order
    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      updatedOrder = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updatedOrder.status,
        },
      };

      const result = await ordersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    //cancel an order
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Deleting the order with id ", id);
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.send(result);
    });

    // ===================REVIEW CRUD OPERATION================
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      console.log("Adding a reivew ", review);
      const result = await reviewsCollection.insertOne(review);
      res.json(result);
    });

    app.get("/reviews", async (req, res) => {
      console.log("Getting all reviews");
      const cursor = await reviewsCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    });

    app.get("/userreview", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = reviewsCollection.find(query);
      const orders = await cursor.toArray();
      res.json(orders);
    });
  } finally {
  }
}

run().catch(console.dir);

// ================================================

app.get("/", async (req, res) => {
  res.send("Hello bikerzzzzzzzz");
});

app.listen(port, () => {
  console.log("Listening to the port ", port);
});
