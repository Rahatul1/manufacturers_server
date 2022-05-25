const express = require('express')
const cors = require('cors');
var jwt = require('jsonwebtoken');
require("dotenv").config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 4000;



app.use(cors())
app.use(express.json())
//
function varifayJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unAuthorization' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fiwkm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const partsCollection = client.db("manufacture-site").collection("parts");
        const purchaseCollection = client.db("manufacture-site").collection("purchases");
        const userCollection = client.db("manufacture-site").collection("users");
        //
        app.get('/parts', async (req, res) => {
            const query = {};
            const cursor = partsCollection.find(query);
            const parts = await cursor.toArray();
            res.send(parts);
        });
        //
        // put user
        app.put('/user/:email', async (req, res) => {
            const email = req?.params?.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options)
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
            res.send({ result, token });
        })
        //
        app.get("/parts/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const partsProducts = await partsCollection.findOne(query);
            res.send(partsProducts);
        });

        //
        app.delete('/purchase/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await purchaseCollection.deleteOne(query);
            res.send(result);
        })
        //
        app.get('/purchase', varifayJWT, async (req, res) => {
            const emailDecode = req.decoded.email;
            const email = req.query.email;
            if (email === emailDecode) {
                const query = { email: email };
                const bookings = await purchaseCollection.find(query).toArray();
                return res.send(bookings);
            } else {
                return res.status(403).send({ messag: 'Forbiden access' })
            }
        })
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