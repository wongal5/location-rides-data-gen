
const moment = require('moment');
const fs = require('fs');
const faker = require('faker');
const coordinates = require('./coordinates');
const json2csv = require('json2csv');

let randomNumberGenerator = (min, max) => {
  return min + Math.random()*(max-min);
}

let randomCityGenerator = (driverId) => {
  let cities = Object.keys(coordinates);
  return cities[driverId%cities.length];
}

let timeIntervalsVolume = () => {
  let result = {};
  // below peak times are in UTC adjusted for america
  let peakTimes = [7, 8, 9, 11, 12, 13, 16, 17, 18];
  for (var i = 0; i < 24; i++) {
    result[i] = null;
  }

  for (var keys in result) {
    if (peakTimes.indexOf(parseInt(keys)) !== -1) {
      result[keys] = Math.ceil(Math.random() * 6000 + 5000)
    } else {
      result[keys] = Math.ceil(Math.random() * 1200 + 2000)
    }
  }
  // let test = Object.values(result).reduce((a,b) => {return a+b})

  return result;
}

let randomTimeBetween = (start, end, daysAgo) => {
  return moment(faker.date.between(moment().startOf('day').subtract(daysAgo, 'days').add(start, 'hour').format('YYYY-MM-DD hh:mm:ssZ'), moment().startOf('day').subtract(daysAgo, 'days').add(end, 'hour'))).format('YYYY-MM-DD hh:mm:ssZ');
}

let uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

let randomCoordinates = (city) => {
  return [city.longitude[0] - Math.random() * (city.longitude[0] - city.longitude[1]), city.latitude[0] - Math.random() * (city.latitude[0] - city.latitude[1])]
}

let generateDriveHistory = (daysAgo) => {

  let results = [];
  let timeIntervals;
  timeIntervals = timeIntervalsVolume();
  for (let times in timeIntervals) {
    var time = parseInt(times);
    let test = randomTimeBetween(time, time + 1);
    var rideVolume = timeIntervals[times];

    for (var i = 0; i <= rideVolume; i++) {
      let driverId = randomNumberGenerator(1, 100000);
      let city = randomCityGenerator(Math.floor(driverId));
      let pick_up = randomCoordinates(coordinates[city]);
      let drop_off = randomCoordinates(coordinates[city]);
      let start = randomCoordinates(coordinates[city]);
      params = {
        driver_id: Math.floor(driverId), price_timestamp: randomTimeBetween(time, time + 1, daysAgo), trip_id: uuidv4(),
        city: city, pick_up_distance: randomNumberGenerator(0, 20).toFixed(2), ride_duration: Math.floor(randomNumberGenerator(3, 30))
      //coordinates: {pick_up_lat: pick_up[1], pick_up_long: pick_up[0], drop_off_lat: drop_off[1], drop_off_long: drop_off[0], start_lat: start[1], start_long: start[0]}
      };
      results.push(params);
    }
  }
  
  return results;
}

let writeDriveHistory = (endDaysAgo, startDaysAgo) => {
  let inserts;
  let csv;
  for (var daysAgo = startDaysAgo; daysAgo > endDaysAgo; daysAgo--) {
    // Builds an array of objects that will simulate how the SQS reconciled data should represent
    inserts = generateDriveHistory(daysAgo);
    csv = json2csv({data: inserts, del: '|'})

    fs.appendFile('./driveHistoryDataWithCoord.csv', csv, (err) => {
      if (err) { console.log('Error', err) };
      console.log('Successful JSON Write');
    })
  }
}
// for 90 days of history, run this file three times with intervals 60-90, 30-60, -1-30
writeDriveHistory(-1, 30);