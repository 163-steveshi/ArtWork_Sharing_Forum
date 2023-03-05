//function that request to switch account status
function swicthStatus(status) {
  //base on the input status
  //send to the server for change Account
  console.log("You want to switch account to: " + status);
  let artist;
  if (status === "patron") artist = false;
  else if (status === "artist") artist = true;
  //make a request object and use it for post to the server for change
  let requestObject = { artist: artist };
  //create a request object
  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
    //If the response is available and was successful
    if (this.readyState == 4 && this.status == 200) {
      alert("sucess");
      //refresh the webpage
      window.location.reload();
    } else if (this.readyState == 4 && this.status == 404) {
      alert(
        "You have to post an artwork to the server to obtain Artist Account"
      );
      //jump to the  post artwork page
      window.open(`/users/${userID}/newArtwork`, "_blank");
    }
  };
  //get userID from the URL
  let userID = window.location.href.split("/")[4];
  //send the requst to server
  xhttp.open("PUT", `/users/${userID}/accountstatus`, true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify(requestObject));
}

window.addEventListener("DOMContentLoaded", (event) => {
  event.preventDefault();

  //get the button and attach the functionality
  const switchButton = document.querySelector(".switch");
  let resultStatus = switchButton.getAttribute("value");
  switchButton.addEventListener("click", (e) => {
    swicthStatus(resultStatus);
  });
});
