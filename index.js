const express = require('express')
const cors = require('cors');
require("dotenv").config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 4000;



app.use(cors())
app.use(express.json())
//
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fiwkm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const partsCollection = client.db("manufacture-site").collection("parts");
        const purchaseCollection = client.db("manufacture-site").collection("purchases");
        //
        app.get('/parts', async (req, res) => {
            const query = {};
            const cursor = partsCollection.find(query);
            const parts = await cursor.toArray();
            res.send(parts);
        });
        //
        app.get("/parts/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const partsProducts = await partsCollection.findOne(query);
            res.send(partsProducts);
        });

        //book done
        app.post('/purchase', async (req, res) => {
            const newPurchase = req.body;
            const results = await purchaseCollection.insertOne(newPurchase);
            res.send(results);
        })

    }
    finally {
        //
    }
}
run().catch(console.dir)

//
app.get('/', (req, res) => {
    res.send('Hello From manufacture website!')
})

app.listen(port, () => {
    console.log(`manufacture app listening on port ${port}`)
})