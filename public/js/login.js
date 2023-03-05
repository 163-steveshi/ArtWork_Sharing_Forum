//function for login
//import the input check
import { checkUserInput } from "./functionLibrary.js";
const login = function () {
  // get input field
  const userName = document.querySelector("#userName").value;
  const password = document.querySelector("#password").value;
  //create object
  let userInformation = {
    userName: userName,
    password: password,
  };
  //do the input test
  if (!checkUserInput(userName, password)) return;
  //pass the test and create a request object
  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      //get the id of the user
      let userIdObject = JSON.parse(this.responseText);
      let userId = userIdObject["userID"];
      console.log(userIdObject);
      //redirect to the user page
      window.open(`/users/${userId}`, "_blank");
    } else if (this.readyState == 4 && this.status == 404) {
      alert(
        "User Doesn't Exist. Please try type correct information or go to register page to create an account"
      );
    }
  };
  //send the requst to server
  xhttp.open("POST", `/users/login`, true);

  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify(userInformation));
};

window.addEventListener("DOMContentLoaded", (event) => {
  //active the button's functionality

  const button = document.getElementById("login");
  button.addEventListener("click", login);
});
