require("dotenv").config();

const express = require("express");
const scheduledFunctions = require("./scheduled/updateDb.js");
const cors = require("cors");
const { default: fetch } = require("node-fetch");
const MyAir = require("./myAir.js");
const dbo = require("./db/connect");
const apiRoutes = require("./routes/api.js");

const app = express();
app.set("port", process.env.SERVER_PORT || 3001);

const client = new MyAir(
  process.env.MYAIR_IP,
  parseInt(process.env.MYAIR_PORT),
  process.env.MYAIR_AIRCON
);

const baseUrl = `http://${client._host}:${client._port}`;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api", apiRoutes);

// Execute scheduled tasks
scheduledFunctions.initScheduledJobs(client);

app.get("/zones", async (req, res) => {
  await client.update();
  res.send(client.zoneArray);
  // console.log(client.zones ='{"z02":{"state":"open"}}');
  console.log(client.zoneArray);
});

app.get("/info", async (req, res) => {
  await client.update();
  res.send(`<pre>${JSON.stringify(client.info, null, 2)}</pre>`);
  // console.log(client.zones ='{"z02":{"state":"open"}}');
  console.log(client.zoneArray);
});

app.get("/update", async (req, res) => {
  await client.update();

  const zones = client.zoneArray;
  const myZone = client.myzone;
  const info = {
    fan: client.info.fan,
    mode: client.info.mode,
    setTemp: client.info.setTemp,
    state: client.info.state,
  };
  let timestamp = new Date();
  timestamp = new Date(
    timestamp.getTime() - timestamp.getTimezoneOffset() * 60 * 1000
  );

  let updateObject = {
    timestamp: timestamp,
    myZone: myZone,
    myZoneName: zones[myZone - 1]["name"],
    ...info,
    zones: [...zones],
  };
  res.send(`<pre>${JSON.stringify(updateObject, null, 2)}</pre>`);
});

// app.use( '/foo', (req, res) => {
//   return res.json({ "foo": "bar" })
// })

app.get("/status", async (req, res) => {
  await fetch(`${baseUrl}/getSystemData`)
    .then((/** @type {{ json: () => any; }} */ response) => response.json())
    .then((/** @type {any} */ result) => {
      res.set("Content-Type", "application/json");
      res.send(result);
    })
    .catch((/** @type {any} */ error) => console.log("error", error));
});

try {
  dbo.connectToServer();
} catch (err) {
  console.error(err);
  process.exit();
}

app.listen(process.env.SERVER_PORT, () => {
  console.log("App listening on port " + app.get("port"));
});
