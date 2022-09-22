const { MongoClient } = require("mongodb");
const connectionString = process.env.DB_CONNECTIONSTRING;
const client = new MongoClient(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let dbConnection;

// module.exports = {
//   connectToServer: function (callback) {
//     client.connect(function (err, db) {
//       if (err || !db) {
//         return callback(err);
//       }

//       dbConnection = db.db(process.env.DB_DATABASE);
//       console.log("Successfully connected to MongoDB");

//       return callback();
//     });
//   },

//   getDb: function () {
//     return dbConnection;
//   },
// };

module.exports = {
  connectToServer: function (callback) {
    client
      .connect()
      .then((db) => {
        dbConnection = db.db(process.env.DB_DATABASE);
        console.log("Successfully connected to MongoDB");
      })
      .catch((err) =>
    {
      return callback(err);
    })
  },
  getDb: function () {
    return dbConnection;
  },
};
