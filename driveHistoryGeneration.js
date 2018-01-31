
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
      params = {driver_id: Math.floor(driverId), price_timestamp: randomTimeBetween(time, time + 1, daysAgo),
        city: randomCityGenerator(Math.floor(driverId)), pick_up_distance: randomNumberGenerator(0, 20).toFixed(2), ride_duration: Math.floor(randomNumberGenerator(3, 30))};
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
    csv = json2csv({data: inserts})

    // if (daysAgo === startDaysAgo) {
    //   fs.writeFile('./driveHistoryData.csv', csv, (err) => {
    //     if (err) { console.log('Error', err) };
    //     console.log('Successful JSON Write');
    //   })
    // } else {
      fs.appendFile('./driveHistoryData.csv', csv, (err) => {
        if (err) { console.log('Error', err) };
        console.log('Successful JSON Write');
      })
    // }


  }
}

writeDriveHistory(-1, 0);