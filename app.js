const express = require("express");
const sequelize = require("./util/database");
// const session = require("express-session");
const cors = require("./middleware/cors");
const { handleError } = require("./util/error");

const TravelOperator = require("./models/travel-operators");
const travelRouter = require("./routes/travel-operators");
const tourRouter = require("./routes/tour");
const authRouter = require("./routes/auth");

const app = express();
const { createServer } = require("http");
const { Server } = require("socket.io");
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
app.use("/api/tour", tourRouter);
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
    const httpServer = createServer(app);
    const io = new Server(httpServer, { 
      cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"]
      }
     });
    io.on("connection", (socket) => {
      console.log("User connected in soccket");
      socket.on('message', (msg) => {
        console.log(msg);
        socket.broadcast.emit('message-broadcast', msg);
       });
    });
    httpServer.listen(3001, () => {
      console.log(`Socket Listening in 3001...`);
    });
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
