const cassandra = require('cassandra-driver');
const distance = cassandra.types.distance;
const moment = require('moment');
const fs = require('fs');

const client = new cassandra.Client({
  contactPoints: ['127.0.0.1'], 
  keyspace: 'rides_matched', 
  pooling: {
    coreConnectionsPerHost: {
      [distance.local]: 2000,
      [distance.remote]: 1
    }
  }
});

let randomNumberGenerator = (min, max) => {
  return Math.floor(min + Math.random()*(max-min));
}

let cities = ['sanFrancisco', 'seattle', 'omaha', 'lasVegas', 'newYork'];
let randomCityGenerator = (driverId) => {
  return cities[driverId%5];
}

let driveHistoryGenerator = (numRows) => {
  let queryDrivers = 'INSERT INTO drivers (driver_id, price_timestamp, city, pick_up_distance, ride_duration) VALUES (?, ?, ?, ?, ?)'
  let queryCities = 'INSERT INTO cities (driver_id, price_timestamp, city, pick_up_distance, ride_duration) VALUES (?, ?, ?, ?, ?)'
  let params;
  let results = [];
  for (var i = 0; i < numRows; i++) {
    let driverId = randomNumberGenerator(1, 100000);
    params = [driverId, moment().subtract(Math.random()*90, 'days').format(), randomCityGenerator(driverId), randomNumberGenerator(0, 20), randomNumberGenerator(3, 30)]
    results.push(params);
    console.log(i)
    // client.execute(queryDrivers, params, { prepare: true })
    //   .catch(err => {
  // console.log(err);
    //   })
    // client.execute(queryCities, params, { prepare: true })
    //   .catch(err => {
    //     console.log(err);
    //   })
  }
  return results;
}

// Step 1: calculate distance using getDistanceFromLatLonInKm
// Step 2: calculate rideFare using calculateRidefare
// Note: fare doesn't include surge multiplier

// function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
//   var radius = 6371; // Radius of the earth in km
//   var dLat = deg2rad(lat2 - lat1);  // deg2rad below
//   var dLon = deg2rad(lon2 - lon1);
//   var a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
//     Math.sin(dLon / 2) * Math.sin(dLon / 2)
//     ;
//   var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   var d = radius * c; // Distance in km
//   return d.toFixed(2);
// }


// Builds an array of objects that will simulate how the SQS reconciled data should represent
var inserts = JSON.stringify(driveHistoryGenerator(100000));

fs.writeFile('./driveHistoryData.json', inserts, (err) => {
  if (err) { console.log('Error', err) };
  console.log('Successful JSON Write');
})


// console.log(moment(faker.date.between(moment(), moment().add(1, 'hour'))).format('MMMM Do YYYY, h:mm:ss a'));
// console.log(generateRandomDrivers(coordinates));
