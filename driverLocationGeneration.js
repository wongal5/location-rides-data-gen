const { promisify } = require('util');
const coordinates = require('./coordinates');
// let redis = require("redis");
// let client = redis.createClient(), multi;
// multi = client.multi();

// client.on("error", function (err) {
//   console.log("Error " + err);
// });


let randomCoordinates = (city) => {
  return [city.longitude[0] - Math.random() * (city.longitude[0] - city.longitude[1]), city.latitude[0] - Math.random() * (city.latitude[0] - city.latitude[1])]
}

let generateRandomDrivers = (cityCoordinates) => {
  let cityArray = Object.keys(cityCoordinates);
  return randomCoordinates(cityCoordinates[cityArray[Math.floor(Math.random() * cityArray.length)]]);
}

console.log(generateRandomDrivers(coordinates));