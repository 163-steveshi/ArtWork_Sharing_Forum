//get userID from the URL
let userID = window.location.href.split("/")[4];

//function that unfllow an artist by ID
function unfollowArtist(artistID) {
  let unfollowed = {};
  unfollowed["unfollowedArtistID"] = artistID;
  //create the ajax request to the server
  let xhttp = new XMLHttpRequest();
  //This is only going to get called when readyState changes
  xhttp.onreadystatechange = function () {
    //If the response is available and was successful
    if (this.readyState == 4 && this.status == 200) {
      alert("unfollowed!");
      //refresh the page to diplay account status changed

      location.reload();
    }
  };

  //send the requst to server

  xhttp.open("DELETE", `/users/${userID}/follow`, true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify(unfollowed));
}
window.addEventListener("DOMContentLoaded", (event) => {
  event.preventDefault();

  //get the number of unfollow button
  //by counting the number of html element with class ="unfollow"
  const unfollowNumber = document.querySelectorAll(".unfollow").length;
  //now loop over all delete button and attach delete function on it
  for (let i = 0; i < unfollowNumber; i++) {
    document.querySelector(`#uf${i}`).addEventListener("click", (e) => {
      //get the Button value which contains the ID of artist to be unfollowed
      let unfollowedArtistId = document
        .getElementById(`uf${i}`)
        .getAttribute("value");
      unfollowArtist(unfollowedArtistId);
    });
  }
  console.log(unfollowNumber);
});
