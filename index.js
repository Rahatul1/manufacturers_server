const express = require('express')
const cors = require('cors');
require("dotenv").config()
const { MongoClient, ServerApiVersion } = require('mongodb');
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
        console.log("Connect")
        const partsCollection = client.db("manufacture-site").collection("parts");
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