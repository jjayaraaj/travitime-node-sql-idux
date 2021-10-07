const express = require("express");
const sequelize = require("./util/database");
// const session = require("express-session");
const cors = require("./middleware/cors");
const { handleError } = require("./util/error");

const TravelOperator = require("./models/travel-operators");
const travelRouter = require("./routes/travel-operators");
const authRouter = require("./routes/auth");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// app.use(
//   session({
//     secret: "Travitime secret",
//     resave: false,
//     saveUninitialized: false,
//   })
// );

//cors
app.use(cors);

//routers
app.use("/api/traveloperator", travelRouter);
app.use("/api/auth", authRouter);

//error handler
app.use((err, req, res, next) => {
  handleError(err, res);
});

const port = process.env.PORT || 3000;
sequelize
  .sync()
  //.sync({ alter: true })
  //.sync({ force: true })
  .then((result) => {
    console.log(result);
    app.listen(port, () => {
      console.log(`Listening in ${port}...`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
//app.listen(port, ()=>{console.log(`Listening in ${port}...`)});

// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/plain');
//   res.end('Hello World');
// });

// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });
