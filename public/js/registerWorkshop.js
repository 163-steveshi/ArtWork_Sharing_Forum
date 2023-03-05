//get the URL of the WorkShop
let workshopID = window.location.href.split("/")[4];
//fucntion that send enroll workshop request
function enrollWorkshop() {
  //create object to store enroll workshop information
  //post to the server and save under specific user's registerWorkshop property
  const workshopName = document.getElementById("name").innerHTML;
  //get the host name from the webpage
  const host = document.getElementById("host").innerHTML;
  const date = document.getElementById("date").innerHTML.split(": ")[1];
  //create the enroll object
  let enrollInformation = {
    workshopName: workshopName,
    workshopID: workshopID,
    host: host,
    date: date,
  };
  //I add an object to the paragraph element with class ageLimit
  //if value = -1 mean there isn't any age restriction
  //otherwise the value is a json string that contain age information
  const ageLimit = document.querySelector(".ageLimit").getAttribute("value");
  if (ageLimit != -1) {
    console.log(ageLimit);
    //parase the age limit json to object
    let ageRestriction = JSON.parse(ageLimit);
    //get the workshop age limit information
    if (ageRestriction.hasOwnProperty("maxAge"))
      enrollInformation["maxAge"] = ageRestriction["maxAge"];
    if (ageRestriction.hasOwnProperty("minAge"))
      enrollInformation["minAge"] = ageRestriction["minAge"];
  }
  console.log(enrollInformation);
  // create a request object
  let xhttp = new XMLHttpRequest();
  //This is only going to get called when readyState changes
  xhttp.onreadystatechange = function () {
    //If the response is available and was successful
    if (this.readyState == 4 && this.status == 200) {
      //IF REGISTER SECESSFUL NOW JUmp to the search page
      alert("Register Success!");
      //refresh the page for show the result
      window.location.reload();
    } else if (this.readyState == 4 && this.status == 401) {
      //userName is occupied and Alert User
      alert("Sorry, You are not loggin in.");
    } else if (this.readyState == 4 && this.status == 403) {
      alert("You are already enrolled!");
    } else if (this.readyState == 4 && this.status == 404) {
      alert("Your age is not qualified!");
    }
  };
  //send the requst to server
  xhttp.open("PUT", `/workshops/${workshopID}`, true);

  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify(enrollInformation));
}

window.addEventListener("DOMContentLoaded", (event) => {
  //active the button's functionality

  const enroll = document.getElementById("enroll");
  enroll.addEventListener("click", enrollWorkshop);
});
