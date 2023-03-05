const express = require("express");
let mongo = require("mongodb");

// Create the Router
let router = express.Router();

//don't change order, otherwise doesn't work
router.get("/users?", searchUserByName); //url that search user by name
router.get("/:userID", getUserProfile); // url that retrive specific user profile by ID
router.post("/", addNewUser); //url that add a new user to the database
router.post("/login", login); //url that verify userinformation and let him log in
router.delete("/:userID/comments", deleteComment); //delete the user's comment on other artwork's in user's profile
router.put("/:userID/accountstatus", changeAccountStatus); //change the type of current user account
router.put("/:artistID/follow", followArtist); //follow the current artist
router.get("/:userID/newArtwork", sendPostArtworkPage); //send the submit artwork page
router.delete("/:userID/follow", unfollowArtist); // unfollow an artist from a user profile
router.delete("/:userID/notifications", deleteNotification); //delete an notification on user profile

//function that handle user's login
function login(req, res, next) {
  //get user input from the request body
  let userInformation = req.body;
  let userName = userInformation["userName"];
  let password = userInformation["password"];

  //create an query object for searching user
  //it has a the format to check all field
  let search = { $and: [] };
  if (userName) {
    search["$and"].push({ userName: { $eq: userName } });
  }
  if (password) {
    search["$and"].push({ password: { $eq: password } });
  }

  //now search in the datbase
  req.app.locals.db.collection("users").findOne(search, (err, result) => {
    //error handling
    if (err) {
      res.status(500).send("Error reading database.");
      return;
    }
    if (!result) {
      //return 404 for user doesn't exist
      res.status(404).send("Incorrect Information");
      return;
    }
    //get the search result
    let searchResult = result;

    let userId = searchResult["_id"];

    //assign the loggedIn userinfo to the session object
    //if find the user information
    req.session.login = true;
    req.session.userID = userId;
    req.session.userName = searchResult["userName"];
    req.session.newAccount = searchResult["newAccount"];
    req.session.artist = searchResult["artist"];
    req.session.birthday = searchResult["birthday"];
    res.status(200).send(JSON.stringify({ userID: userId }));
  });
}
//redirect to User Profile that cotains the User Name
function searchUserByName(req, res, next) {
  let userName = req.query.username;
  //replace emptyspace symbol to empty from the url
  userName = userName.replaceAll("%20", " ");
  //now search user by name in database
  req.app.locals.db
    .collection("users")
    .findOne({ userName: { $eq: userName } }, (err, result) => {
      if (err) console.log(err);
      //find the target user and get its id
      let targetUserID = result._id.toString();
      //redirect to another url for access the profile
      res.status(200).redirect(`/users/${targetUserID}`);
    });
}
//function that search user by id
function getUserProfile(req, res, next) {
  //try to get the object id in database
  let oid;
  try {
    console.log(req.params.userID);

    oid = new mongo.ObjectId(req.params.userID);
  } catch {
    res.status(404).send("404 Unknown ID");
    return;
  }
  //search the object in the database with object id
  req.app.locals.db
    .collection("users")
    .findOne({ _id: oid }, function (err, result) {
      //error handling for searching
      if (err) {
        res.status(500).send("Error reading database.");
        return;
      }
      if (!result) {
        res.status(404).send("Unknown ID");
        return;
      }

      let userInformation = result;

      //now search in the database
      //with the name of user to find all his/her artwork
      req.app.locals.db
        .collection("artworks")
        .find({ artist: userInformation.userName })
        .toArray((err, result) => {
          if (err) console.log(err);
          let artworkResult = result;
          //now base on user is artist or not
          //call corrsponding pug file to render
          if (userInformation["artist"]) {
            res.status(200).render("pages/artistUser", {
              user: userInformation,
              loginUser: req.session.userName,
              login: req.session.login,
              loginUserID: req.session.userID,
              artworks: artworkResult,
            });
            //userProfile is normal user
          } else if (!userInformation["artist"]) {
            res.status(200).render("pages/basicUser", {
              user: userInformation,
              loginUser: req.session.userName,
              login: req.session.login,
              loginUserID: req.session.userID,
            });
          }
        });
    });
}

//function that add new user to the database
function addNewUser(req, res, next) {
  let newUser = req.body;

  let newUserName = newUser["userName"];
  //search the username in the database
  //try to find duplicate name or not
  req.app.locals.db
    .collection("users")
    .find({ userName: { $eq: newUserName } })
    .toArray((err, result) => {
      //if we find result
      //return 403
      if (result.length > 0)
        res.status(403).send("Current User Name is occupied");
      //when no repeat user name
      else {
        console.log("start insert to the Database");
        //add user property to the object
        newUser["followed"] = {};
        newUser["reviews"] = {};
        newUser["artist"] = false;
        newUser["registeredWorkshop"] = [];
        newUser["notification"] = [];
        newUser["newAccount"] = true;

        //insert to the database
        req.app.locals.db
          .collection("users")
          .insertOne(newUser, (err, result) => {
            if (err) console.log(err);
            else {
              console.log(result);
              res.status(200).end();
            }
          });
      }
    });
}

//function that handle delete comment by user
function deleteComment(req, res, next) {
  //authorization check
  if (!req.session.login)
    res.status(401).send("Unauthorized!Please Login First");

  if (req.session.userID != req.params.userID)
    res.status(403).send("You are not the account owner");
  //in user's comment object
  //each comment is store with commended artwork's ID as the key
  //get this id and use it for delete
  let request = req.body;
  let commentArtID = request["removeArtID"];

  let artworkoID = new mongo.ObjectId(commentArtID);
  //artwork also storage the comment
  //each artwork store the comment in a object
  //with the commended user ID as key,
  //so use user ID to remove the comment
  let useroID = new mongo.ObjectId(req.session.userID);

  //now use below string  to specific the filed to be delete
  let reviewUserID = `reviews.${req.session.userID}`;
  //now delete comment from the artwork object
  req.app.locals.db
    .collection("artworks")
    .updateOne(
      { _id: artworkoID },
      { $unset: { [reviewUserID]: 1 } },
      (err, result) => {
        if (err) console.log(err);
        else {
          console.log(result);
        }
      }
    );
  //create a string to specific which comment to be removed from user object
  let reviewArtID = `reviews.${commentArtID}`;
  //remove comment on the user Side
  req.app.locals.db
    .collection("users")
    .updateOne(
      { _id: useroID },
      { $unset: { [reviewArtID]: 1 } },
      (err, result) => {
        if (err) console.log(err);
        else {
          console.log(result);
          res.status(200).end();
        }
      }
    );
}
//function that send the page for artist to submit artwork
function sendPostArtworkPage(req, res, next) {
  //authorization part
  if (!req.session.login)
    res.status(401).send("Unauthorized!Please Login First");
  if (!req.session.newAccount && !req.session.artist)
    res.status(403).send("Unauthorized!You are not in artist account");
  //past the authorization send the page
  else
    res.status(200).render("pages/addNewArt", {
      login: req.session.login,
      loginUserID: req.session.userID,
    });
}
//function that switch user account mode
function changeAccountStatus(req, res, next) {
  //authorization part
  if (!req.session.login)
    res.status(401).send("Unauthorized!Please Login First");
  if (req.session.userID != req.params.userID)
    res.status(403).send("Unauthorized! You are not the account onwner");
  let userID = req.session.userID;
  //make the userID to the  Object ID
  let useroID = new mongo.ObjectId(userID);

  //try to find if the database has one artwork of the current user
  //if has switch account to the artist
  //if not, promote the user to the post artwork page
  req.app.locals.db
    .collection("artworks")
    .findOne({ artist: { $eq: req.session.userName } }, (err, result) => {
      if (err) console.log(err);
      console.log(result);
      //fine the artwork
      //start to change the status for this account
      if (result) {
        let requestObject = req.body;
        //get the status boolean
        //this variable: a boolean indicator that
        //user wants to change account to patron or artist
        //true: artist
        //false: patron
        let requestsAccountStatus = requestObject["artist"];
        console.log(requestsAccountStatus);

        //now start to swicth user account status
        req.app.locals.db
          .collection("users")
          .updateOne(
            { _id: useroID },
            { $set: { artist: requestsAccountStatus } },
            (err, result) => {
              if (err) console.log(err);
              //update the session too
              req.session.artist = requestsAccountStatus;
              //if the session.newAccount is set to be true
              //and the requestsAccountStatus is true
              //this means that user is first time to switch patron account to artist account
              //this is a new user. It doesn't have artist property in its account,
              //so we need to add it to the user Object
              //then set it newAccount to false
              console.log(result);
              if (req.session.newAccount && requestsAccountStatus) {
                req.app.locals.db.collection("users").updateOne(
                  { _id: useroID },

                  { $set: { follower: {}, newAccount: false } },
                  (err, result) => {
                    if (err) console.log(err);
                    console.log(result);
                    //now update the session newAccount indicator
                    req.session.newAccount = false;
                    res.status(200).send();
                  }
                );
              } else res.status(200).send();
            }
          );
      }
      //this an acount that haven't post any artwork
      //promote it to post artwork page
      else {
        res.status(404).send("Please upload an artwork first");
      }
    });
}
//function that follow Artist
function followArtist(req, res, next) {
  //authorization part
  if (!req.session.login) res.status(401).send("Please Logged In first");
  if (req.session.userID === req.params.artistID)
    res.status(403).send("You can't follow yourself");
  //create the objectID of the User and Artist
  //Then use it to search document
  //update the artist follower property
  //and update the user's followed property
  let useroID = new mongo.ObjectId(req.session.userID);
  let artistoID = new mongo.ObjectId(req.params.artistID);
  let followArtist = req.body;

  //first update the user's followed property
  //mongodb string for the update query
  let followArtistID = `followed.${req.params.artistID}`;
  req.app.locals.db
    .collection("users")
    .updateOne(
      { _id: useroID },
      { $set: { [followArtistID]: followArtist } },
      (err, result) => {
        if (err) console.log(err);
        console.log(result);
        //npw update the Artist follower property
        //mongodb string for update the query
        let followUserID = `follower.${req.session.userID}`;
        let followerInformation = {
          followerID: useroID, //store an object ID for easily send notification latter
          followerName: req.session.userName,
        };
        req.app.locals.db
          .collection("users")
          .updateOne(
            { _id: artistoID },
            { $set: { [followUserID]: followerInformation } },
            (err, result) => {
              if (err) console.log(err);
              console.log(result);
              res.status(200).end();
            }
          );
      }
    );
}
//function that unfollow the artist
function unfollowArtist(req, res, next) {
  //authorization part
  if (!req.session.login) res.status(401).send("Please Logged In first");
  if (req.session.userID != req.params.userID)
    res.status(403).send("You can't unfollow Other with not your account");
  let unfollowInfo = req.body;

  let useroID = new mongo.ObjectId(req.params.userID);
  //write the query for delete the followed artist
  let unfollowArtistID = `followed.${unfollowInfo["unfollowedArtistID"]}`;

  //start to delete from the follower user document
  req.app.locals.db
    .collection("users")
    .updateOne(
      { _id: useroID },
      { $unset: { [unfollowArtistID]: 1 } },
      (err, result) => {
        if (err) console.log(err);
        console.log(result);
        //then update the artist's follower record
        //create the object Artist Id
        let artistoID = new mongo.ObjectId(unfollowInfo["unfollowedArtistID"]);
        //write the query for delete the follwer
        let unfollowUserID = `follower.${req.params.userID}`;

        req.app.locals.db
          .collection("users")
          .updateOne(
            { _id: artistoID },
            { $unset: { [unfollowUserID]: 1 } },
            (err, result) => {
              if (err) console.log(err);
              console.log(result);
              res.status(200).end();
            }
          );
      }
    );
}

//function for handle delete the notification
function deleteNotification(req, res, next) {
  //authorization part
  if (!req.session.login) res.status(401).send("Please Logged In first");
  if (req.session.userID != req.params.userID)
    res
      .status(403)
      .send("You can't delete notification that is not on your account");

  let deletedMessage = req.body;
  let useroId = new mongo.ObjectId(req.params.userID);
  //delete from the user's notification property
  req.app.locals.db
    .collection("users")
    .updateOne(
      { _id: useroId },
      { $pull: { notification: deletedMessage["notification"] } },
      (err, result) => {
        if (err) console.log(err);
        console.log(result);
        res.status(200).end();
      }
    );
}
//export the router object for base app to access
module.exports = router;
