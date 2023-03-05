const express = require("express");
let mongo = require("mongodb");

//global arrary for render the search result and search page
let categoryArray = [];
let searchResult = [];
let mediumArray = [];
// Create the Router
let router = express.Router();

//don't change order, otherwise doesn't work
router.get("/search", sendSearchPage); //send search form page
router.get("/searchresult/:page", sendSearchResultByPage); //send search resultpage
router.get("/artworks?", searchArtwork); //search the artwork
router.get("/:artworkID", getArtwork); //get specific artwork
router.post("/", postArtWork, newArtworkNotification); //post artwork and send notification to the follower
//add comment to current artwork, notice comment is an inner object
//of the artwork, so use put request
router.put("/:artworkID", addComment);

//send the search Artwork page
function sendSearchPage(req, res, next) {
  //find all category key
  req.app.locals.db
    .collection("artworks")
    .distinct("category")
    .then((values) => {
      categoryArray = values;

      //now find all type of medium in the database
      req.app.locals.db
        .collection("artworks")
        .distinct("medium")
        .then((values) => {
          mediumArray = values;
          //then redner to the page
          res.status(200).render("pages/searchArt", {
            category: categoryArray,
            medium: mediumArray,
            login: req.session.login,
            loginUserID: req.session.userID,
          });
        });
    });
}
//function that search the artwork
function searchArtwork(req, res, next) {
  //get user input from the url
  let artist = req.query.artist;
  let name = req.query.name;
  let year = req.query.year; //year is a string in database
  let category = req.query.category;
  let medium = req.query.medium;
  //create an query object for searching in database
  let search = { $and: [] };
  console.log(category);

  //check if user type category information
  //ignore the choose if user type category = all
  if (category && category != "All")
    search["$and"].push({ category: category });

  //check if user type the medium or not
  //ignore the choose if user type medium = all
  if (medium && medium != "All") search["$and"].push({ medium: medium });
  //check if user type year
  if (year) search["$and"].push({ year: year });
  //check if user type the artist
  if (artist) {
    //since we need to dyamic take artist value
    //create a regular express object
    //and use that for mongodb search
    let artRegex = new RegExp(`${artist}`, "i");
    search["$and"].push({ artist: { $regex: artRegex } });
  }
  if (name) {
    //since we need to dyamic take artist value
    //create a regular express object
    //and use that for mongodb search
    let nameRegex = new RegExp(`${name}`, "i");
    search["$and"].push({ name: { $regex: nameRegex } });
  }

  //if user doesn't type any search
  //empty it mean show all artworks
  if (search["$and"].length === 0) search = {};
  //find all type of category in the database
  req.app.locals.db
    .collection("artworks")
    .find(search)
    .toArray((err, result) => {
      console.log(result);
      //store the search result in a file scope array
      //later we can use it for show only 10 result per page
      searchResult = result;

      //redirect to another page for displaying the result
      res.redirect("/artworks/searchresult/0");
    });
}

//function get specific artwork by the artwork ID
function getArtwork(req, res, next) {
  //try to get the object id in database
  let oid;
  //try if we can create an valid object id
  try {
    oid = new mongo.ObjectId(req.params.artworkID);
  } catch {
    res.status(404).send("404 Unknown ID");
    return;
  }
  //search the object in the database with object id
  req.app.locals.db
    .collection("artworks")
    .findOne({ _id: oid }, function (err, result) {
      if (err) {
        res.status(500).send("Error reading database.");
        return;
      }
      //error handling if artwork doesn't exist
      if (!result) {
        res.status(404).send("Unknown ID");
        return;
      }
      //if have the result render to the pug file
      // the pug file will use login, loginUser, and loginUserID
      // to decide whether provide comment section or not
      res.status(200).render("pages/artwork", {
        artwork: result,
        login: req.session.login,
        loginUser: req.session.userName,
        loginUserID: req.session.userID,
      });
    });
}
//function send the artwork search result by page
function sendSearchResultByPage(req, res, next) {
  let requestPage = Number(req.params.page);
  let upperIndex = requestPage * 10 + 10; //the last index of artwork will be send
  let lowerIndex = requestPage * 10; //the first index of artwork will be send
  let partial_SearchResult = [];
  let last_Page = false; //indicator to know whether this is the last page or no the last page

  //check if it is the last page or not
  //if it is the last page, it could be less than 10 object
  //turn the upper index to the length of searchResult
  if (upperIndex >= searchResult.length) {
    upperIndex = searchResult.length;
    last_Page = true;
  }
  for (let i = lowerIndex; i < upperIndex; i++) {
    partial_SearchResult.push(searchResult[i]);
  }
  //make an object to store for render or send to client side js
  let results = { searchResult: partial_SearchResult, lastPage: last_Page };
  //json for page over first 10 results (Page after first Page)
  //html for show the first 10 results (first Page)
  res.format({
    "application/json": function () {
      res.status(200).send(JSON.stringify(results));
    },
    "text/html": function () {
      res.status(200).render("pages/searchArtResult", {
        results: partial_SearchResult,
        login: req.session.login,
        loginUserID: req.session.userID,
      });
    },
  });
}
// function add comment to specifc artwork and also store a copy of comment to the person
//who makes the comment
function addComment(req, res, next) {
  //check if user login in
  if (!req.session.login) res.status(401).send("Unauthorized!Please Log in.");
  //check not the artist make comment on his/her own artwork
  if (req.session.login && req.session.userName === req.body["artist"]) {
    res.status(403).send("You can't comment your own artwork");
  }

  //when login in and the user is not artist, starts to add to the database
  else {
    //create two copy of comment object for save one on artwork and another on user
    let commentArtSide = {
      like: req.body["like"],
      comment: req.body["comment"],
    };
    let commentUserSide = {
      like: req.body["like"],
      comment: req.body["comment"],
      artworkName: req.body["artworkName"],
      artworkID: req.body["artworkID"],
    };
    //now create the user object id and artwork object ID
    //for insert to the database
    let artworkoID = new mongo.ObjectId(req.params.artworkID);
    let commentUserID = new mongo.ObjectId(req.session.userID);
    //comment side need currently comment user information
    //for display on the artwork page
    commentArtSide["commentUser"] = req.session.userName;
    commentArtSide["commentUserID"] = req.session.userID;

    //write the query srting about the position to store in comment in the artwork
    //object
    let commentForART = `reviews.${commentUserID}`;
    //now write comment to the artwork object
    req.app.locals.db
      .collection("artworks")
      .updateOne(
        { _id: artworkoID },
        { $set: { [commentForART]: commentArtSide } },
        (err, result) => {
          if (err) console.log(err);
          else {
            console.log(result);
          }
        }
      );
    //use the artworkID as the Key of the comment when insert to user's review
    let newReview = `reviews.${req.params.artworkID}`;
    req.app.locals.db
      .collection("users")
      .updateOne(
        { _id: commentUserID },
        { $set: { [newReview]: commentUserSide } },
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

//function that handle the post artwork
function postArtWork(req, res, next) {
  //check if user login
  if (!req.session.login)
    res.status(401).send("Please Login in for uploading artwork");
  let newArtwork = req.body;
  //create a property call review for store other user's reivew
  newArtwork["reviews"] = {};
  //check the artist equal to the the UserName, if not, deny upload the image
  //can't upload the image that is not belongs to himself/herself
  if (newArtwork["artist"] != req.session.userName)
    res.status(403).send("You can't publish not your work");
  //check if there is an artwork with repeated Name
  //if repeated deny the upload
  req.app.locals.db
    .collection("artworks")
    .find({ name: newArtwork["name"] })
    .toArray((err, result) => {
      if (err) console.log(err);
      console.log(result.length);
      if (result.length > 0)
        res.status(404).send("You can't upload an repeated Artwork");
      //now add the artwork to the collection when no duplicate value
      else
        req.app.locals.db
          .collection("artworks")
          .insertOne(newArtwork, (err, result) => {
            if (err) console.log(err);
            console.log(result);
            //if successful upload
            //call the next middlware function
            next();
          });
    });
}
//function that send the notification
function newArtworkNotification(req, res, next) {
  //create a userID object
  //use it to find the current User's follower
  let useroID = new mongo.ObjectId(req.session.userID);
  req.app.locals.db
    .collection("users")
    .findOne({ _id: useroID }, (err, result) => {
      if (err) console.log(err);
      else {
        //get the current Artist Name use for latter message
        let artisName = result["userName"];
        //first time upload artwork
        //it is possible that not have follower property
        //only send notification if has the property
        if (result["follower"]) {
          //get the follower object and convert to the array
          let follower = Object.values(result["follower"]);
          console.log(result["follower"]);
          let followerIDArray = [];
          //loop over the folloer array and extract the objectID of follower ID
          for (let i = 0; i < follower.length; i++) {
            followerIDArray.push(follower[i]["followerID"]);
          }
          //write the message out
          let message = `Check it out, ${artisName} creates a new artwork`;
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
                  res.status(200).send();
                }
              }
            );
        }
        //first time to verify become artist
        //no follower at current moment
        else res.status(200).send();
      }
    });
}
//export the router object for base app to access
module.exports = router;
