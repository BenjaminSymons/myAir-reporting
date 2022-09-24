const { MongoClient, Logger } = require("mongodb");
const connectionString = process.env.DB_CONNECTIONSTRING;
const client = new MongoClient(connectionString);

let dbConnection;

Logger.setLevel("debug");

module.exports = {
  connectToServer: function () {
    client
      .connect()
      .then((db) => {
        dbConnection = db.db(process.env.DB_DATABASE);
        console.log("Successfully connected to MongoDB");
      })
      .catch(console.dir);
  },
  getDb: function () {
    return dbConnection;
  },
};
