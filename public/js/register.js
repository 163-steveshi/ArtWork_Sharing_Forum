//import the user input check funtion
import { checkUserInput } from "./functionLibrary.js";
//function for register
const register = function () {
  //get input field
  const userName = document.querySelector("#userName").value;
  const password = document.querySelector("#password").value;
  const birthday = document.querySelector("#date").value;
  //check the input
  //if it is valid, add to the object new User
  if (!checkUserInput(userName, password)) return;
  let newUser = { userName: userName, password: password };
  if (birthday.trim().length > 0) {
    newUser["birthday"] = birthday;
  } else {
    alert("Please choose an valid Birthday");
    return;
  }
  //create a ajax request object after pass the validation test
  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
    //If the response is available and was successful
    if (this.readyState == 4 && this.status == 200) {
      //IF REGISTER SECESSFUL NOW JUmp to the search page
      alert("Register Success! Please Login in!");
      window.open(`/login`, "_blank"); //might not work
    } else if (this.readyState == 4 && this.status == 403) {
      //userName is occupied and Alert User
      alert("Sorry, someone has picked this userName. Please Try again");
    }
  };
  //send the requst to server
  xhttp.open("POST", `/users`, true);

  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify(newUser));
};

window.addEventListener("DOMContentLoaded", (event) => {
  //active the register button's functionality

  const button = document.getElementById("register");
  button.addEventListener("click", register);
});
