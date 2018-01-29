let redis = require("redis");
let client = redis.createClient(), multi;
const { promisify } = require('util');
// const geoaddAsync = promisify(client.geoadd).bind(client);
// const execAsync = promisify(client.multi.exec).bind(client);
multi = client.multi();

client.on("error", function (err) {
  console.log("Error " + err);
});

let coordinates = {
  sanFrancisco: {
    latitude: [37.788164, 37.722025],
    longitude: [-122.508212, -122.370385]
  },
  seattle: {
    latitude: [47.732895, 47.553408],
    longitude: [-122.425989, -122.266016]
  },
  omaha: {
    latitude: [41.310582, 41.202976],
    longitude: [-96.117089, -95.939122]
  },
  lasVegas: {
    latitude: [36.189783, 36.145853],
    longitude: [-115.240241, -115.105658]
  },
  newYork: {
    latitude: [40.866646, 40.595648],
    longitude: [-74.211799, -73.73899]
  }
}

let randomCoordinates = (city, random) => {
  return [city.longitude[0] - Math.random() * (city.longitude[0] - city.longitude[1]), city.latitude[0] - Math.random() * (city.latitude[0] - city.latitude[1])]
}

let generateRandomDrivers = (cityCoordinates) => {
  let cityArray = Object.keys(cityCoordinates);
  let coord;
  let batchSize = 10000;
  let numberBatches = 3;
  for (var a = 0; a < numberBatches; a++) {
    insertData = [];
    for (var i = 0; i < batchSize; i++) {
      coord = randomCoordinates(cityCoordinates[cityArray[Math.floor(Math.random() * cityArray.length)]]);
      coord.push(i + a * batchSize);
      multi.geoadd('locations', ...coord);
      console.log('added', i + a * batchSize);
    }
    var start = new Date().getTime();
    multi.exec(() => {
      console.log('Execution Time', new Date().getTime() - start, 'ms');
    });
  }
}

generateRandomDrivers(coordinates);