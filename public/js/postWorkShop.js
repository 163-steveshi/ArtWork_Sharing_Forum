//request for the artwork part
function postWorkShop() {
  //start by checking the Input from User
  const title = document.querySelector("#title").value;
  const minAge = document.querySelector("#minAge").value;
  const maxAge = document.querySelector("#maxAge").value;
  const description = document.querySelector("#description").value;
  const date = document.querySelector("#date").value;
  const time = document.querySelector("#time").value;
  let workshop = {};

  //validation test on user input
  if (title.trim().length > 0) workshop["title"] = title;
  else {
    alert("Please type the title in the textbox");
    return;
  }
  //when user type minage
  //check if it is number and greater than 0
  if (minAge)
    if (Number.isInteger(Number(minAge)) && Number(minAge) > 0)
      workshop["minAge"] = minAge;
    else {
      alert(
        "Please type the minAge in the textbox and must be a postive value"
      );
      return;
    }
  //when user type maxage
  //check if it is number and greater than 0
  if (maxAge)
    if (Number.isInteger(Number(maxAge)) && Number(maxAge) > 0)
      workshop["maxAge"] = maxAge;
    else {
      alert(
        "Please type a valid maxAge in the textbox and must be a postive value"
      );
      return;
    }
  //when user both type min age and max age
  //make sure min age < max age
  if (minAge && maxAge) {
    if (Number(maxAge) <= Number(minAge)) {
      alert("max age shoudl be greater than minmum age");
      return;
    }
  }
  if (description.trim().length > 0) workshop["description"] = description;
  else {
    alert("Please type the description in the textbox");
    return;
  }
  if (date.trim().length > 0) workshop["date"] = date;
  else {
    alert("Please choose the date in the startdate selection");
    return;
  }
  if (time.trim().length > 0) workshop["time"] = time;
  else {
    alert("Please choose the date in the startdate selection");
    return;
  }
  console.log(workshop);
  //after pass the validation test
  //now start to send to the server
  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
    //If the response is available and was successful
    if (this.readyState == 4 && this.status == 200) {
      alert("Uploaded Success!");
      //refresh the page to diplay account status changed
    } else if (this.readyState == 4 && this.status == 404) {
      alert("You can't host repeated timeslot workshop ");
    } else if (this.readyState == 4 && this.status == 401) {
      alert("You need to login in and use your own account to host workshop");
    }
  };
  //send the requst to server
  //where to putID
  xhttp.open("POST", `/workshops`, true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify(workshop));
}

window.addEventListener("DOMContentLoaded", (event) => {
  event.preventDefault();
  console.log("Test My Script");
  const submit = document.getElementById("submit");
  submit.addEventListener("click", postWorkShop);
});
