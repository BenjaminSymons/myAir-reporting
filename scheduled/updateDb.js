const CronJob = require("node-cron");
const dbo = require("../db/connect");
const MyAir = require("../myAir");

/**
 *
 * @param {MyAir} client a MyAir client
 */
exports.initScheduledJobs = (client) => {
  const scheduledJobFunction = CronJob.schedule("*/15 * * * *", async () => {
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

    let updateObject = {
      timestamp: timestamp,
      myZone: myZone,
      myZoneName: zones[myZone - 1]["name"],
      ...info,
      zones: [...zones],
    };

    const dbConnect = dbo.getDb();

    dbConnect.collection("Zones").insertOne(updateObject);

    console.log(`Updated records: ${timestamp.toLocaleString()}`);
  });

  scheduledJobFunction.start();
};

// exports.testUpdate = async (client) => {
//   await client.update();

//   let zones = client.zones;
//   let timestamp = new Date();
//   timestamp = new Date(
//     timestamp.getTime() - timestamp.getTimezoneOffset() * 60 * 1000
//   );

//   let updateObject = { timestamp: timestamp, ...zones };
//   const dbConnect = dbo.getDb();

//   dbConnect.collection("Zones").insertOne(updateObject);

//   console.log("Updated records");
// };
