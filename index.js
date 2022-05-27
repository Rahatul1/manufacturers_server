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
        const upadteProfileCollection = client.db("manufacture-site").collection("upadteProfile");
        //
        // // varifay admin
        // const verifyAdmin = async (req, res, next) => {
        //     const requester = req.decoded.email;
        //     const requesterAccount = await userCollection.findOne({ email: requester });
        //     if (requesterAccount.role === 'admin') {
        //         next();
        //     }
        //     else {
        //         res.status(403).send({ message: 'forbidden' });
        //     }
        // }

        //
        app.get('/parts', async (req, res) => {
            const query = {};
            const cursor = partsCollection.find(query);
            const parts = await cursor.toArray();
            res.send(parts);
        });

        // product add 
        app.post('/parts', async (req, res) => {
            const newProduts = req.body;
            const results = await partsCollection.insertOne(newProduts);
            res.send(results);
        })

        // prduct delete
        app.delete('/parts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await partsCollection.deleteOne(query);
            res.send(result);
        })

        // admin roles
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })
        })

        // user get
        app.get('/user', varifayJWT, async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        })
        app.get('/manageAllOrder', varifayJWT, async (req, res) => {
            const users = await purchaseCollection.find().toArray();
            res.send(users);
        })

        //admin make
        app.put('/user/admin/:email', varifayJWT, async (req, res) => {
            const email = req?.params?.email;
            const requester = req.decoded.email;
            const requesterAccunt = await userCollection.findOne({ email: requester });
            if (requesterAccunt.role === 'admin') {
                const filter = { email: email };
                const updateDoc = {
                    $set: { role: 'admin' },
                };
                const result = await userCollection.updateOne(filter, updateDoc)
                res.send(result);
            }
            else {
                res.status(403).send({ message: "Forbiden" })
            }
        })

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
        app.delete('/purchase/:email', varifayJWT, async (req, res) => {
            const email = req?.params?.email;
            const filter = { email: email };
            const result = await purchaseCollection.deleteOne(filter);
            res.send(result);
        });
        // app.delete('/purchase/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const result = await purchaseCollection.deleteOne(query);
        //     res.send(result);
        // })

        // 
        app.get('/purchase', varifayJWT, async (req, res) => {
            const decodedEmail = req?.decoded?.email;
            const email = req?.query?.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = purchaseCollection.find(query);
                const myItem = await cursor.toArray();
                res.send(myItem);
            } else {
                res.status(404).send({ message: 'Not Found' })
            }
        })

        //book done
        app.post('/purchase', async (req, res) => {
            const newPurchase = req.body;
            const results = await purchaseCollection.insertOne(newPurchase);
            res.send(results);
        })

        //---upadteProfileCollection
        // app.get('/profileUpdate', async (req, res) => {
        //     
        //     const cursor = upadteProfileCollection.find(query);
        //     const parts = await cursor.toArray();
        //     res.send(parts);
        // });

        app.post('/profileUpdate', async (req, res) => {
            const newPurchase = req.body;
            const results = await upadteProfileCollection.insertOne(newPurchase);
            res.send(results);
        })
        app.get('/profileUpdated', varifayJWT, async (req, res) => {
            const query = {};
            const users = await upadteProfileCollection.find(query).toArray();
            res.send(users);
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