// const Koa = require('koa');
// let app = new Koa();
let redis = require("redis");
let client = redis.createClient();
client.on("error", function (err) {
  console.log("Error " + err);
});

// app.use(ctx => {
//   ctx.body = 'Hello Koa';
// });

// let port = 3000;

// app.listen(port, () => {
//   console.log('Koa is listening on port ' + port);
// });




// module.exports = {client};