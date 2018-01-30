let driveHistory = require('./driveHistoryData.json');
const cassandra = require('cassandra-driver');
const distance = cassandra.types.distance;

const client = new cassandra.Client({
  contactPoints: ['127.0.0.1'], 
  keyspace: 'rides_matched', 
  pooling: {
    coreConnectionsPerHost: {
      [distance.local]: 2,
      [distance.remote]: 1
    }
  }
});

let bulkInsert = () => {
  let queryDrivers = 'INSERT INTO drivers (driver_id, price_timestamp, city, pick_up_distance, ride_duration) VALUES (?, ?, ?, ?, ?)'
  let queryCities = 'INSERT INTO cities (driver_id, price_timestamp, city, pick_up_distance, ride_duration) VALUES (?, ?, ?, ?, ?)'

  for (var i = 0; i < 10000; i++) {
    const queries = [
      {
        query: queryDrivers,
        params: driveHistory[i]
      },
      {
        query: queryCities,
        params: driveHistory[i]
      }
    ]
    console.log(i, driveHistory[i]);
    client.batch(queries, { prepare: true })
      .catch(err => {
        console.log(err);
      })
  }
  return;
}

bulkInsert();
