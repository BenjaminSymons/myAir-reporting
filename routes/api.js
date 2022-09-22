const express = require("express");

const apiRoutes = express.Router();
const dbo = require("../db/connect");

apiRoutes.route("/api").get(async function (req, res) {
  const dbConnect = dbo.getDb();

  dbConnect
    .collection("Zones")
    .find({})
    .limit(50)
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send("Error fetching zones!");
      } else {
        res.json(result);
      }
    });
});

apiRoutes.route("/api/add").post(function (req, res) {
  const dbConnect = dbo.getDb();

  dbConnect.collection("matches").insertOne(res, function (err, result) {
    if (err) {
      res.status(400).send("Error inserting zones");
    } else {
      console.log(`Added a new temp recording for all zones with id ${result.insertedId}`);
      res.status(204).send();
    }
  });
});

module.exports = apiRoutes;
