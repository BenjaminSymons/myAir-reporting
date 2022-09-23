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

    let zones = client.zones;
    let myZone = client.myzone;
    let mode = client.mode;
    let fan = client.fanspeed;
    let timestamp = new Date();
    timestamp = new Date(
      timestamp.getTime() - timestamp.getTimezoneOffset() * 60 * 1000
    );

    let updateObject = { timestamp: timestamp, myzone: myZone, mode: mode, fanspeed:fan, ...zones };
    const dbConnect = dbo.getDb();

    dbConnect.collection("Zones").insertOne(updateObject);

    console.log(`Updated records: ${timestamp}`);
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
