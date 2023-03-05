//get the information from the website
//create an object on it
let artistID = window.location.href.split("/")[4];
let artistName = document.querySelector("#userName").getAttribute("value");
let artistInfo = {
  artistID: artistID,
  artistName: artistName,
};

//function to fllow artist
function followArtist() {
  //create a request for send to the client
  let xhttp = new XMLHttpRequest();
  //This is only going to get called when readyState changes
  xhttp.onreadystatechange = function () {
    //If the response is available and was successful
    if (this.readyState == 4 && this.status == 200) {
      //use the respond text to insert to the div container
      //receice a object about the userObject ID
      window.alert("Success. Thanks for Following");
      location.reload();
    }
  };
  //send the requst to server
  xhttp.open("PUt", `/users/${artistID}/follow`, true);

  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify(artistInfo));
}

window.addEventListener("DOMContentLoaded", (event) => {
  //active the button's functionality

  const follow = document.getElementById("follow");
  follow.addEventListener("click", followArtist);
});
