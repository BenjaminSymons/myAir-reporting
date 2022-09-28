const express = require("express");
const createError = require("http-errors");
const router = express.Router();
const dbo = require("../db/connect");

router.get("/", async function (req, res) {
  const dbConnect = dbo.getDb();
  dbConnect
    .collection("Zones")
    .find({})
    // .limit(50)
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send("Error fetching zones!");
      } else {
        res.json(result);
      }
    });
});

router.get("/zones", async function (req, res) {
  const dbConnect = dbo.getDb();
  dbConnect
    .collection("Zones")
    .find({})
    // .limit(50)
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send("Error fetching zones!");
      } else {
        let temp = result.map(element => {
          for (let index = 0; index < element.zones.length; index++) {
            const currentElement = element.zones[index];
            element[currentElement.name] = currentElement.measuredTemp
          }
          delete element.zones;
        })
        result = [...result, temp];
        // res.json(docs);
        res.json(result);
        // res.send(`<pre>${JSON.stringify(result, null, 2)}</pre>`);
      }
    });
});

router.get('/all', async function(req, res) {
  const agg = [
    {
      '$unwind': {
        'path': '$zones'
      }
    }, {
      '$project': {
        'timestamp': '$timestamp', 
        'zone': '$zones.name', 
        'temperature': '$zones.measuredTemp'
      }
    }
  ];
  
  const dbConnect = dbo.getDb();

  const coll = dbConnect.collection('Zones');
  const cursor = coll.aggregate(agg);
  const result = await cursor.toArray();
  // res.send(`<pre>${JSON.stringify(result, null, 2)}</pre>`);
  res.json(result);
  // await dbConnect.close();
})

router.get("/:name", async function (req, res) {
  const dbConnect = dbo.getDb();
  dbConnect
    .collection("Zones")
    .find({ name: req.params.name })
    .limit(50)
    .toArray(function (err, result) {
      if (err) {
        res
          .status(400)
          .send(`Error fetching zone for param ${req.params.name}!`);
      } else {
        res.json(result);
      }
    });
});

module.exports = router;
