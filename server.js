require('dotenv').config();

const express = require("express");
const scheduledFunctions = require('./scheduled/updateDb.js');
const cors = require("cors");
const fetch = require("node-fetch");
const MyAir = require("./myAir.js");
const dbo = require("./db/connect");

const app = express();
app.set("port", process.env.SERVER_PORT || 3001);

const client = new MyAir(
  process.env.MYAIR_IP,
  process.env.MYAIR_PORT,
  process.env.MYAIR_AIRCON
);

const baseUrl = `http://${client._host}:${client._port}`;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Execute scheduled tasks
scheduledFunctions.initScheduledJobs(client);

// // Global error handling
// app.use(function (err, _req, res) {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

// app.get("/", (req, res) => {
//   scheduledFunctions.testUpdate(client);
//   res.send("Hi There");
// });

app.get("/zones", async (req, res) => {
  await client.update();
  res.send(client.zoneArray);
  // console.log(client.zones ='{"z02":{"state":"open"}}');
  console.log(client.zoneArray);
});

// app.use( '/foo', (req, res) => {
//   return res.json({ "foo": "bar" })
// })

app.get("/status", async (req, res) => {
  await fetch(`${baseUrl}/getSystemData`)
    .then((response) => response.json())
    .then((result) => {
      res.set("Content-Type", "application/json");
      res.send(result);
    })
    .catch((error) => console.log("error", error));
});

dbo.connectToServer(() =>{
  if(err) {
    console.error(err);
    process.exit();
  }
});

app.listen(process.env.SERVER_PORT, () => {
  console.log("App listening on port " + app.get("port"));
});
