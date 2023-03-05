//get userID from the URL
let userID = window.location.href.split("/")[4];

//function that delete comment
//take an input is the artwork ID
function deleteComment(artID) {
  let removeComment = {};
  removeComment["removeArtID"] = artID;
  //send the request to the server for remove comment
  let xhttp = new XMLHttpRequest();
  //This is only going to get called when readyState changes
  xhttp.onreadystatechange = function () {
    //If the response is available and was successful
    if (this.readyState == 4 && this.status == 200) {
      alert("Comment Delete Success!");
      //refresh the page to diplay account status changed
      window.open(window.location.href);
    }
  };

  //send the requst to server
  //where to putID
  xhttp.open("DELETE", `/users/${userID}/comments`, true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify(removeComment));
}
window.addEventListener("DOMContentLoaded", (event) => {
  event.preventDefault();

  //get the number of delete button
  //by counting the number of html element with class ="delete"
  const deleteButtonNumber = document.querySelectorAll(".delete").length;
  //now loop over all delete button and attach delete function on it
  for (let i = 0; i < deleteButtonNumber; i++) {
    document.querySelector(`#d${i}`).addEventListener("click", (e) => {
      //get the Button value which contains the ID of artwork
      let deletedArtId = document.getElementById(`d${i}`).getAttribute("value");
      deleteComment(deletedArtId);
    });
  }
  console.log(deleteButtonNumber);
});
