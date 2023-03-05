let mongo = require("mongodb");
let MongoClient = mongo.MongoClient;
let db;

//read data frpm the server
let arts = require("./gallery.json");
let users = {};
let artworks = []; //Stores all of the cards, key=id
arts.forEach((art) => {
  art["reviews"] = {}; //for check user's review
  art["category"] = art["category"].toLowerCase();
  art["medium"] = art["medium"].toLowerCase();
  artworks.push(art);
  //for each art work
  //create a user account for this artwork if the artist current have no account
  if (!users.hasOwnProperty(art.artist)) {
    //no duplicated artwork
    //create new user for that art work
    //by default user has a default password
    //can be change later
    users[art.artist] = {
      follower: {},
      userName: art.artist,
      password: "password",
      artist: true,
      followed: {},
      reviews: {},
      registeredWorkshop: [],
      notification: [],
      birthday: "1960-05-16",
      newAccount: false,
    };
  }
});

console.log(artworks.length);
console.log(Object.values(users).length);
// Connect to the mongodb and prepare for insert the data
MongoClient.connect(
  "mongodb://127.0.0.1:27017/",
  { useNewUrlParser: true },
  function (err, client) {
    if (err) throw err;
    //get the database we want to insert
    db = client.db("artGallery");

    //start by clean the artwork collection
    db.dropCollection("artworks", function (err, result) {
      if (err) {
        console.log(
          "Error dropping collection. Likely case: collection did not exist (don't worry unless you get other errors...)"
        );
      } else {
        console.log("Cleared artwork collection.");
      }

      db.collection("artworks").insertMany(artworks, function (err, result) {
        if (err) throw err;
        console.log(
          "Successfuly inserted " + result.insertedCount + " artworks."
        );
        process.exit();
      });
    });
    //now clean the user collections
    db.dropCollection("users", function (err, result) {
      if (err) {
        console.log(
          "Error dropping collection. Likely case: collection did not exist (don't worry unless you get other errors...)"
        );
      } else {
        console.log("Cleared User collection.");
      }

      db.collection("users").insertMany(
        Object.values(users),
        function (err, result) {
          if (err) throw err;
          console.log(
            "Successfuly inserted " + result.insertedCount + " users."
          );
          process.exit();
        }
      );
    });

    //now drop the old workshops collection
    //create the new workshop collection
    db.dropCollection("workshops", function (err, result) {
      if (err) {
        console.log(
          "Error dropping workshops collection. Likely case: collection did not exist (don't worry unless you get other errors...)"
        );
      } else {
        console.log("Cleared workshops collection.");
      }
      db.createCollection("workshops", function (err, res) {
        if (err) throw err;
        console.log("workshops created!");
        process.exit();
      });
    });
  }
);
