//function that send search the artwork request to the server
const search = function () {
  //read user category choose and get current category choose value
  const categoryChoose = document.querySelector("#category");
  let category = categoryChoose.options[categoryChoose.selectedIndex].value;
  //read user medium choose and get current user choose value
  //get other input filed
  const mediumChoose = document.querySelector("#medium");
  let medium = mediumChoose.options[mediumChoose.selectedIndex].value;
  const artist = document.querySelector("#artist").value;
  const name = document.querySelector("#name").value;
  const year = document.querySelector("#year").value;

  //create a url string
  //insert the category andmedium, since there is always a catgeory and medium
  let url = `artworks?category=${category}&medium=${medium}`;

  //user input validation check
  if (artist.trim().length > 0) url += `&artist=${artist}`;

  if (name.trim().length > 0) url += `&name=${name}`;

  if (year.trim().length > 0) url += `&year=${year}`;

  console.log(url);
  //create a request object
  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
    //If the response is available and was successful
    if (this.readyState == 4 && this.status == 200) {
      //use the respond text to insert to the div container
      window.alert("Here is the searching Result");
      window.open("/artworks/searchresult/0", "_blank");
    }
  };
  //send the requst to server
  xhttp.open("Get", url, true);

  xhttp.send();
};

window.addEventListener("DOMContentLoaded", (event) => {
  //active the button's functionality
  const button = document.getElementById("search");
  button.addEventListener("click", search);
});
