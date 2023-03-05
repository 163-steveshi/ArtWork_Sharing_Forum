//get userID from the URL
let userID = window.location.href.split("/")[4];
console.log(userID);

//delete by message content
function deleteNotification(message) {
  let deletedMessage = {};
  deletedMessage["notification"] = message;
  //send the request to the server
  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
    //If the response is available and was successful
    if (this.readyState == 4 && this.status == 200) {
      //refresh the page to show the notification get deleted

      location.reload();
    }
  };

  //send the requst to server

  xhttp.open("DELETE", `/users/${userID}/notifications`, true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify(deletedMessage));
}
window.addEventListener("DOMContentLoaded", (event) => {
  event.preventDefault();

  //get the number of read button
  //by counting the number of html element with class ="message"
  const notificationNumber = document.querySelectorAll(".message").length;
  //now loop over all read button and attach delete notification function on it
  for (let i = 0; i < notificationNumber; i++) {
    document.querySelector(`#m${i}`).addEventListener("click", (e) => {
      //get the Button value which contains the notification to be deleted
      let deletedMessage = document
        .getElementById(`m${i}`)
        .getAttribute("value");
      deleteNotification(deletedMessage);
    });
  }
});
