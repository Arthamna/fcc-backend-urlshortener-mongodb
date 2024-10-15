require('dotenv').config();
const express = require ('express');
const cors = require ('cors');
const app = express();

app.use(express.json()); // for parsing application/json
app.use(cors()); //because different ports
app.use(express.urlencoded({extended: true}));

const { MongoClient } =  require('mongodb');
console.log(process.env); //checking the env.
const client = new MongoClient(process.env.MONGODB_URI);
//check if url is true
const dns = require("dns")
const urlparser = require("url")
//specify name database 
const db = client.db("urlshort")
const urlorigin = db.collection("urlorigin")

// Basic Configuration (for dbs)
const port = process.env.PORT || 3000;

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
// config env secret by adding gitgitnore .env
app.post('/api/shorturl', function(req, res){
  console.log(req.body)
  const url = req.body.url;
  const dnslookup = dns.lookup(urlparser.parse(url).hostname, async (err,address) =>{
    if (!address){
      res.json({error: "Invalid URL"})
    }else{

      //use number for count shortener url
      const countUrl = await urlorigin.countDocuments({})
      const urlDocum ={
        url, 
        short_url: countUrl
      }

      const result = await urlorigin.insertOne(urlDocum)
      console.log(result);
      res.json({ original_url: url, short_url: countUrl});
    }
  })
 
});

app.get("/api/shorturl/:short_url", async (req,res) => {
  const shorturl = req.params.short_url
  const urlDocum = await urlorigin.findOne({ short_url :+shorturl})
  res.redirect(urlDocum.url) 
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
