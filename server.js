//import require module
const express = require("express");
const logger = require("morgan");
const path = require("path");
let mongo = require("mongodb");
const session = require("express-session"); //add express-session
let artworkRouter = require("./router/artworkRouter");
let userRouter = require("./router/userRouter");
let workshopRouter = require("./router/workshopRouter");

//create mongoClient
let MongoClient = mongo.MongoClient;

// Start express app
const app = express();
//use morgan to show the request type
app.use(logger("dev"));
//locate the file dirctory
app.use(express.static("public"));
//convert request body to json
app.use(express.json());

//use pug for the template engine
//set the template engine
app.set("view engine", "pug");
//set pug file path
app.set("views", path.join(__dirname, "views"));

//add session object
//create the session
app.use(
  session({
    secret: "some secret here",
    //the cookie will expire in 30 mins if user doesn't have activity
    cookie: { maxAge: 1800000 },
    resave: true,
    saveUninitialized: false,

    //using rolling to send to every middlware
    //for renew the expired session value: the maxAge
    rolling: true,
    //by default it is not logged in
    //use for determine display the my profile anchor link
    login: false,
  })
);
//home page
app.get(["/", "/home"], sendHomepage);
//the login page
app.get("/login", sendLoginInPage);
//the register page
app.get("/register", sendRegisterPage);
app.get("/logout", logoutUser);
//use  router for request start with specific url
app.use("/artworks", artworkRouter);
app.use("/users", userRouter);
app.use("/workshops", workshopRouter);
//callback function that send Home Page
function sendHomepage(req, res, next) {
  //render infornmation decide whether shows view my profile or not
  res.status(200).render("pages/home", {
    login: req.session.login,
    loginUserID: req.session.userID,
  });
}
//callback function that send Login Page
function sendLoginInPage(req, res, next) {
  res.status(200).render("pages/login", {
    login: req.session.login,
    loginUserID: req.session.userID,
  });
}
//callback function that send Register Page
function sendRegisterPage(req, res, next) {
  res.status(200).render("pages/register", {
    login: req.session.login,
    loginUserID: req.session.userID,
  });
}
//callback function that log out current login User
function logoutUser(req, res, next) {
  // Set the session loggedin property to false.
  if (req.session.login) {
    req.session.login = false;
  }
  res.redirect(`http://localhost:3000/home`);
}

// Initialize database connection
MongoClient.connect(
  "mongodb://127.0.0.1:27017/",
  { useNewUrlParser: true },
  function (err, client) {
    if (err) throw err;

    //use variable to store the database access
    app.locals.db = client.db("artGallery");

    // Start server once Mongo is initialized
    app.listen(3000);
    console.log("Listening on port 3000");
    console.log("http://localhost:3000");
  }
);
