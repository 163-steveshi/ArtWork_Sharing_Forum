const e = require("express");
const express = require("express");
let mongo = require("mongodb");

// Create the Router
let router = express.Router();

router.get("/workshops?", searchWorkShopByArtistName); //search the workshoop by artist name
router.get("/:workshopID", getSpecificWorkshop); //get specificworkshop by its id
router.get("/:userID/newWorkshop", sendCreateWorkshopPage); //send the artist to create workshop page
router.post("/", createWorkshop, newWorkshopNotification); //for artist to creat workshop and send notification to other follower
// register for specific workshop, workshop has
//a nest object record  register user
//modify the object for register, so use put rather than post
router.put("/:workshopID", registerSpecificWorkshop);

//function that search the workshop by artist name
function searchWorkShopByArtistName(req, res, next) {
  let host = req.query.host;
  //search all the workshop that is host by current artist
  req.app.locals.db
    .collection("workshops")
    .find({ host: { $eq: host } })
    .toArray((err, result) => {
      if (err) console.log(err);
      console.log(result);

      //render the result on the pug file
      res.status(200).render("pages/workshops", {
        host: host,
        workshops: result,
        login: req.session.login,
        loginUserID: req.session.userID,
      });
    });
}

//fucntion that send create workshop page to the artist
function sendCreateWorkshopPage(req, res, next) {
  //authorization part
  if (!req.session.login)
    res.status(401).send("Please Login in for create workshop");
  if (!req.session.artist)
    res
      .status(401)
      .send(
        "Your Account is patron account, and only Artist are allowed to access this page"
      );

  //if the login user is artist
  //render the page
  res.status(200).render("pages/createWorkshop", {
    login: req.session.login,
    loginUserID: req.session.userID,
  });
}

//function that create the artwork
function createWorkshop(req, res, next) {
  //authorization
  if (!req.session.login)
    res.status(401).send("Please Login in for uploading artwork");
  if (!req.session.artist)
    res
      .status(401)
      .send(
        "Your Account is patron account, and only Artist are allowed to access this page"
      );

  //if user pass all authorization
  //start to create object for insert to mongodb
  let newWorkshop = req.body;
  //insert the host
  newWorkshop["host"] = req.session.userName;
  newWorkshop["hostID"] = req.session.userID;
  //insert the sub empty object for the register User
  newWorkshop["registeredUser"] = [];
  //now try to find it there is a time conflict workshop
  req.app.locals.db
    .collection("workshops")
    .find({
      $and: [
        { time: { $eq: newWorkshop["time"] } },
        { date: { $eq: newWorkshop["date"] } },
      ],
    })
    .toArray((err, result) => {
      if (err) console.log(err);
      if (result.length > 0)
        res.status(404).send("You can't host an same timeslot workshop");
      //for no time conflict now add the workshop to the collection
      else
        req.app.locals.db
          .collection("workshops")
          .insertOne(newWorkshop, (err, result) => {
            if (err) console.log(err);
            //call next middleware function--send notification
            next();
          });
    });
}
//function for get specific workshop by workshop id
function getSpecificWorkshop(req, res, next) {
  //create the workshop object id and search in the collection
  let workShopoid = new mongo.ObjectId(req.params.workshopID);

  //search the object in the database with object id
  req.app.locals.db
    .collection("workshops")
    .findOne({ _id: workShopoid }, function (err, result) {
      //error handling
      if (err) {
        res.status(500).send("Error reading database.");
        return;
      }
      if (!result) {
        console.log(result);
        res.status(404).send("Unknown ID");
        return;
      }
      //render the page
      res.status(200).render("pages/specificWorkshop", {
        workshop: result,
        loginUser: req.session.userName,
        login: req.session.login,
        loginUserID: req.session.userID,
      });
    });
}
//function for handling user register Artist workshop
function registerSpecificWorkshop(req, res, next) {
  //authorzation part
  if (!req.session.login) res.status(401).send("Unauthorized! Please login!");
  let enrollInformation = req.body;
  if (req.session.userName === enrollInformation["host"])
    res
      .status(403)
      .send("You can't register this workshop, becasue your are the host");
  //make two date object for check age limit
  //one is user Birthday
  //another one is workshop host day
  let userAge = new Date(req.session.birthday);
  let eventDate = new Date(enrollInformation["date"]);

  // million second dives by 31536000000 get full year difference
  let differenceInyear = (eventDate - userAge) / 31536000000;
  //two tets indicator
  let minAgeTest = false;
  let maxAgeTest = false;
  if (enrollInformation.hasOwnProperty("minAge")) {
    //when the workshop has minAge requirement
    //use date - user's age date which equal to millionsecond
    //convert millionsecond to year
    //if result >= minAge (year)
    //fit the requirement
    //update the boolean value
    if (differenceInyear >= Number(enrollInformation["minAge"])) {
      console.log("You pass the minimum Age");
      minAgeTest = true;
    }
  } else {
    //the workshop doesn't has the miniAge requirement
    //just update the boolean
    minAgeTest = true;
  }
  if (enrollInformation.hasOwnProperty("maxAge")) {
    //when the workshop has minAge requirement
    //use date - user's age date  which equal to millionsecond
    //convert millionsecond to year
    //if result <= maxAge (year)
    //fit the requirement
    if (differenceInyear <= Number(enrollInformation["maxAge"])) {
      console.log("You pass the maximum Age");
      maxAgeTest = true;
    }
  } else {
    //the workshop doesn't has the maxage requirement
    //just update the boolean
    maxAgeTest = true;
  }

  //user pass the register test
  //prepare to insert to the database
  let registerUser = {
    registerUserID: req.session.userID,
    registerUserName: req.session.userName,
  };
  //create the workshop ObjectId
  //use this objectID to search in the database
  //when two test pass
  //add register user to the workshop-->registerUser Array
  if (minAgeTest && maxAgeTest) {
    let workshopoID = new mongo.ObjectId(req.params.workshopID);
    req.app.locals.db
      .collection("workshops")
      .updateOne(
        { _id: workshopoID },
        { $addToSet: { registeredUser: registerUser } },
        (err, result) => {
          if (err) console.log(err);
          else {
            console.log("line180: ");
            console.log(result.modifiedCount === 0);
            //I use $addToSet to insert new User to the document's property
            //means only add if not exists
            //if the modifiedCount ===0
            //which means that User is already register
            //send 403 indicates that user is already enrolled
            if (result.modifiedCount === 0)
              res.status(403).send("You are already enrolled");
            //if it is first time enroll
            //then update the user's register workshop record too
            else {
              //create User's Object ID
              let useroID = new mongo.ObjectId(req.session.userID);
              let registerWorkShopInfo = {
                workshopID: req.params.workshopID,
                workshopName: enrollInformation["workshopName"],
              };
              //now go to the mongodb to record the register Workshop
              req.app.locals.db
                .collection("users")
                .updateOne(
                  { _id: useroID },
                  { $addToSet: { registeredWorkshop: registerWorkShopInfo } },
                  (err, result) => {
                    if (err) console.log(err);
                    else {
                      console.log(result);
                      res.status(200).end();
                    }
                  }
                );
            }
          }
        }
      );
  } else res.status(404).send("Your are not qualify the age requirement!");
}

//function for send the new workshop notification to the follower
function newWorkshopNotification(req, res, next) {
  //create the user object id
  let useroID = new mongo.ObjectId(req.session.userID);
  //now search the artist and get its follower information
  req.app.locals.db
    .collection("users")
    .findOne({ _id: useroID }, (err, result) => {
      if (err) console.log(err);
      else {
        //get the artist name for write notification message
        let artisName = result["userName"];

        //get the follower information and get the array
        let follower = Object.values(result["follower"]);
        let followerIDArray = [];
        //use a new array to store all follwer's object id
        // to search in the database and write notification
        for (let i = 0; i < follower.length; i++) {
          followerIDArray.push(follower[i]["followerID"]);
        }
        //create the message
        let message = `Check it out, ${artisName} creates a new workshop`;
        //send message to every follower
        req.app.locals.db
          .collection("users")
          .updateMany(
            { _id: { $in: followerIDArray } },
            { $push: { notification: message } },
            (err, result) => {
              if (err) console.log(err);
              else {
                console.log(result);
                res.status(200).end();
              }
            }
          );
      }
    });
}
module.exports = router;
