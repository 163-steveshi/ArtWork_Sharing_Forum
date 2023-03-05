//global variable that stores a review object to be add
let review = {};
//get the artwork ID by split in array
//the fouth index is the object ID
let artworkID = window.location.href.split("/")[4];
let artworkName = document.getElementById("name").innerHTML.split(": ")[1];
let artistName = document.getElementById("artist").getAttribute("value");
//insert the information to the object
review["artworkName"] = artworkName;
review["artworkID"] = artworkID;
review["artist"] = artistName;

//function that post comment to the server
function postComment() {
  const comment = document.getElementById("comment").value;
  //input validation check
  if (comment.trim().length === 0 || comment === "Write your Comment Here") {
    alert("Please Type a comment before submit");
    return;
  }
  //add comment property to the review object
  review["comment"] = comment;
  //pass the validation test now send the request to the server
  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
    //If the response is available and was successful
    if (this.readyState == 4 && this.status == 200) {
      alert("Comment Add Success!");
      //refresh the page if comment post successful
      window.open(window.location.href);
    }
  };

  //send the requst to server
  xhttp.open("PUT", `/artworks/${artworkID}`, true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify(review));
}
//function if user like the artwork
//add like to the review object
function like() {
  review["like"] = true;
}
window.addEventListener("DOMContentLoaded", (event) => {
  event.preventDefault();
  const likeButton = document.querySelector("#like");
  likeButton.addEventListener("click", like);
  const submit = document.querySelector("#submit");
  submit.addEventListener("click", postComment);
});
